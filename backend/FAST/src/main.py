import sys
import os
import pandas as pd
import copy
import random
import math
import time
from utils import computeParetoFront, acceptanceProbability, updateParetoSet
from global_sol.utils_global import perturbate, perturbate_with_heu_g, compute_objective_ranges, average_amount_of_domination, min_domination_difference, cluster_archive, perturbate_validity
from global_sol.data_classes_global import GlobalUniversity
import json

# original main.py file taken from 'https://github.com/4nnina/FAST-UI/tree/main/src'

def performSa_AMOSA_UI(curr_sol,archive,initialTemp,finalTemp,alpha,iters_per_temp,HL,SL,heuristic=False,seed=None,print_debug=False,file='',output_dir=''):
    if seed is not None:
        random.seed(seed)

    temp = initialTemp
    c=0

    if not archive:
        archive.add(copy.deepcopy(curr_sol))
    current_pt = random.choice(list(archive))

    while True: #temp > finalTemp:
        for _ in range(iters_per_temp):
            if not heuristic:
                new_pt = perturbate(current_pt)
            else:
                new_pt = perturbate_with_heu_g(current_pt)

            if new_pt == current_pt:
                continue

            all_solutions = set(archive)
            all_solutions.add(current_pt)
            all_solutions.add(new_pt)
            mins, maxs = compute_objective_ranges(all_solutions)

            current_dominates_new = current_pt.dominate(new_pt)
            new_dominates_current = new_pt.dominate(current_pt)

            dominating_new = set()
            dominated_by_new = set()
            for p in archive:
                if p is new_pt or p is current_pt:
                    continue
                if p.dominate(new_pt):
                    dominating_new.add(p)
                elif new_pt.dominate(p):
                    dominated_by_new.add(p)

            k = len(dominating_new) # TODO

            if print_debug:
                print("Temp:", temp)
                print("Archive size:", len(archive))
                print("k dominating new:", k)

            
            #CASE 1: current dominates new
            if current_dominates_new:
               
                dominators = set(dominating_new)
                dominators.add(current_pt)
                delta_avg = average_amount_of_domination(dominators, new_pt, mins, maxs)

                prob = 1/(1+math.exp(delta_avg*temp))

                if random.random() < prob:
                    current_pt = new_pt  
                    

            #CASE 3: new domimates current
            elif new_dominates_current:
                
                if k > 0:
                    #Case 3(a): 
                    delta_min, best_arch = min_domination_difference(new_pt, dominating_new, mins, maxs)
                    prob = 1/(1+math.exp(-delta_min))

                    
                    if random.random() < prob and best_arch is not None:
                        current_pt = best_arch
                    else:
                        current_pt = new_pt
                else:
                    
                    if not dominated_by_new:
                        #Case 3(b)
                        current_pt = new_pt
                        archive.add(new_pt)
                        
                        if current_pt in archive:
                            archive.discard(current_pt)
                        elif len(archive)> SL:
                            archive = cluster_archive(archive, HL)
                        
                    else:
                        #Case 3(c)
                        current_pt = new_pt
                        archive.add(new_pt)
                        archive.difference_update(dominated_by_new)

            #CASE 2
            else:
                if k > 0:
                    #Case 2(a)
                    delta_avg = average_amount_of_domination(dominating_new, new_pt, mins, maxs)
                    prob = 1/(1+math.exp(-delta_avg *temp))
                    prob = min(1.0, max(0.0, prob))

                    if random.random() < prob:
                        current_pt = new_pt  
                else:
                    if not dominated_by_new:
                        #Case 2(b)
                        current_pt = new_pt
                        archive.add(new_pt)
                        if len(archive) > SL:
                            archive = cluster_archive(archive, HL)
                    else:
                        #Case 2(c)
                        current_pt = new_pt
                        archive.add(new_pt)
                        archive.difference_update(dominated_by_new)

            
            if len(archive) > SL:
                archive = cluster_archive(archive, HL)

            best_sol = max(archive, key=lambda x: x.fairness_score())
            print("\n" + "="*80)
            print(f"Temperature: {temp:.2f}")

            ## --- updated code --- ##

            conflicts: dict = {
                "iteration": c+1,
                "conflicts": [],
            }

            assignments: dict = {
                "iteration": c+1,
                "assignments": []
            }

            constraints: dict = {
                "iteration": c+1,
                "constraints": []
            }

            def fromTuplesToLanguage(slots: list) -> list:
                slotsNew: list = []
                for s in slots:
                    numToDay: dict = {
                        0: "Lun",
                        1: "Mar",
                        2: "Mer",
                        3: "Gio",
                        4: "Ven",
                        5: "Sab",
                        6: "Dom"
                    }
                    numToHour: dict = {
                        0: "8:30-9:30",
                        1: "9:30-10:30",
                        2: "10:30-11:30",
                        3: "11:30-12:30",
                        4: "12:30-13:30",
                        5: "13:30-14:30",
                        6: "14:30-15:30",
                        7: "15:30-16:30",
                        8: "16:30-17:30",
                        9: "17:30-18:30",
                        10: "18:30-19:30"
                    }
                    slotsNew.append(f"{numToDay[s[0]]} {numToHour[s[1]]}")
                return slotsNew
            
            def fromTimelineToHours(timeline):
                takenList = []
                days = 5
                hours = 11
                for day in range(days):
                    for hour in range(hours):
                        if timeline[day][hour] is not None:
                            takenList.append((day, hour))
                return fromTuplesToLanguage(takenList)
            
            def fromConstraintsToHours(constraints, impossible):
                constrList = []
                days = 5
                hours = 11
                for day in range(days):
                    for hour in range(hours):
                        if (constraints[day][hour]==-1 and impossible) or (constraints[day][hour]==-0.5 and not impossible):
                            constrList.append((day, hour))
                return fromTuplesToLanguage(constrList)

            for prof in sorted(best_sol.list_prof, key=lambda x: x.name):
                assignments["assignments"].append({
                    "prof_id": prof.name,
                    "slots": fromTimelineToHours(prof.timeline)
                })
                conflicts["conflicts"].append({
                    "prof_id": prof.name,
                    "better_not_unsatisfied": fromTuplesToLanguage(prof.get_unsatisfied_constraints()),
                    #"impossible_unsatisfied": fromTuplesToLanguage(prof.get_unsatisfied_impossible_constraints())
                })
                constraints["constraints"].append({
                    "prof_id": prof.name,
                    "better_not_slots": fromConstraintsToHours(prof.constraints, False),
                    #"impossible_slots": fromConstraintsToHours(prof.constraints, True)
                })

            with open(os.path.join(output_dir, "conflicts.json"), "w") as file:
                json.dump(conflicts, file, indent=4)

            with open(os.path.join(output_dir, "assignments.json"), "w") as file:
                json.dump(assignments, file, indent=4)

            with open(os.path.join(output_dir, "constraints.json"), "w") as file:
                json.dump(constraints, file, indent=4)

            # Save timeline allocation for degrees only
            timeline_allocation: dict = {}

            # Load module ID to module name mapping
            module_id_to_name = {}
            try:
                with open('../dataset/university/map_module_id.csv', 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for line in lines[1:]:  # Skip header
                        line = line.strip()
                        if line:
                            parts = line.split(',', 1)  # Split only on first comma
                            if len(parts) == 2:
                                module_id = parts[0].strip()
                                module_name = parts[1].strip()
                                module_id_to_name[module_id] = module_name
                print(f"Loaded {len(module_id_to_name)} module mappings")
                print(f"Sample mappings: {dict(list(module_id_to_name.items())[:3])}")
            except Exception as e:
                print(f"Warning: Could not load module mapping: {e}")
                module_id_to_name = {}
            
            degree_mapping = {
                "Laurea in Biotecnologie [385] Corsi di laurea - UNICO": "Bio",
                "Laurea in Informatica [420] Corsi di laurea - UNICO": "Inf",
                "Laurea in Bioinformatica [419] Corsi di laurea - UNICO": "BioInf"
            }
            
            for degree_timeline in best_sol.list_degree:
                degree_name = degree_timeline.degree
                degree_year = degree_timeline.year
                short_name = degree_mapping[degree_name]
                
                
                key = f"{short_name} year {degree_year}"
                
                # Convert timeline (5 days x 11 hours) to day-based format with transformed labels
                days = ["mon", "tue", "wed", "thu", "fri"]
                schedule = {}
                
                for day_idx, day_name in enumerate(days):
                    schedule[day_name] = []
                    for hour in range(11):
                        slot = degree_timeline.timeline[day_idx][hour]
                        schedule[day_name].append(slot)
                
                timeline_allocation[key] = {
                    "degree": degree_name,
                    "year": degree_year,
                    "schedule": schedule,
                    "fairness_score": degree_timeline.fairness_score()
                }
            
            if timeline_allocation:
                timeline_filename = f"timeline_allocation_{c+1:03d}.json"
                timeline_path = os.path.join(output_dir, timeline_filename)
                with open(timeline_path, "w") as file:
                    json.dump(timeline_allocation, file, indent=4)

            ## --------------------- ##

            print(best_sol.getSingleFairnessScore())
            print(f"Current Fairness Score: {best_sol.fairness_score()}")
            print("="*80)

            
            c+=1
        # raffreddamento geometrico
        temp *= alpha

    if len(archive)> SL:
        archive = cluster_archive(archive, HL)

    return archive


def getBestSol_AMOSA_UI(curr_sol,initialTemp,finalTemp,alpha,iters_per_temp, HL,SL,heuristic,seed=None,file='',output_dir=''):
    sol = copy.deepcopy(curr_sol)
    archive = set()
    archive.add(sol)

    #print(f"Initial Fairness Score: {sol.fairness_score()}")

    archive = performSa_AMOSA_UI(sol,archive,initialTemp,finalTemp,alpha,iters_per_temp,HL,SL,heuristic=heuristic,seed=seed,file=file,output_dir=output_dir)

    best_sol = max(archive, key=lambda x: x.fairness_score())

    print("\n" + "="*80)
    print("FINAL RESULT:")
    print(best_sol.getSingleFairnessScore())
    #print(f"Final Fairness Score: {best_sol.fairness_score()}")
    print("="*80)

    return best_sol

def main():

    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, '..', 'dataset', 'university')
    csv_path = os.path.join(dataset_path, 'lecture_timeslots.csv')

    possible_paths = [csv_path]

    csv_path = None
    for path in possible_paths:
        if os.path.exists(path):
            csv_path = path
            break
    
    if not csv_path:
        print("ERROR: Could not find lecture_timeslots.csv in any of these locations:")
        for path in possible_paths:
            print(f"- {path}")
        sys.exit(1)

    schedule = pd.read_csv(csv_path)

    degrees = [
        "Laurea in Biotecnologie [385] Corsi di laurea - UNICO",
        "Laurea in Informatica [420] Corsi di laurea - UNICO",
        "Laurea in Bioinformatica [419] Corsi di laurea - UNICO"
    ]

    schedule = schedule[schedule["degree"].isin(degrees)]

    prof = schedule["prof_id"].unique().tolist()
    dict_degree = {degree: [1, 2, 3] for degree in degrees}

    print("Creating initial solution...")
    obj = GlobalUniversity(prof, dict_degree)

    def process_section(section):
        section_data = {
            "professors": [],
            "degrees": {},
            "avg_prof": None,
            "std_prof": None,
            "avg_degree": None,
            "std_degree": None,
            "avg_overall": None,
            "std_overall": None,
            # "final_fairness": None,
            # "std_final_fairness": None,
            "Fairness < 100%": 0,
            "Worst Percentage": 100
        }

        degree_mapping = {
            "Laurea in Biotecnologie [385] Corsi di laurea - UNICO": "Bio",
            "Laurea in Informatica [420] Corsi di laurea - UNICO": "Inf",
            "Laurea in Bioinformatica [419] Corsi di laurea - UNICO": "BioInf"
        }

        sec_out = 'prof'
        
        lines = section.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if line.startswith("Prof Name:"):
                parts = line.split('\t')
                if len(parts) >= 3:
                    prof_name = parts[0].split(": ")[1].strip()
                    fairness_score = float(parts[1].split(": ")[1].strip())
                    percentage = float(parts[2].strip().replace("%", ""))
                    
                    if percentage < 100:
                        section_data["Fairness < 100%"] += 1
                    if percentage < section_data["Worst Percentage"]:
                        section_data["Worst Percentage"] = percentage
                    
                    section_data["professors"].append({
                        "name": prof_name,
                        "fairness": fairness_score,
                        "percentage": percentage
                    })
            
            elif line.startswith("Degree Name:"):
                sec_out = 'degree'
                parts = line.split('\t')
                if len(parts) >= 3:
                    original_name = parts[0].split(": ")[1].strip()
                    year = int(parts[1].split(": ")[1].strip())
                    fairness_score = float(parts[2].split(": ")[1].strip())
                    
                    short_name = degree_mapping.get(original_name, original_name)
                    key = f"Fairness Score year {year} {short_name}"
                    section_data["degrees"][key] = fairness_score

            elif "Average Fairness Score:" in line and sec_out == 'prof':
                section_data['avg_prof'] = float(line.split(": ")[1].strip())
            elif "Standard Deviation Fairness Score:" in line and sec_out == 'prof':
                section_data['std_prof'] = float(line.split(": ")[1].strip())
            elif "Average Fairness Score:" in line and sec_out == 'degree':
                section_data['avg_degree'] = float(line.split(": ")[1].strip())
            elif "Standard Deviation Fairness Score:" in line and sec_out == 'degree':
                section_data['std_degree'] = float(line.split(": ")[1].strip())
            elif "Average Fairness Score Overall:" in line:
                section_data['avg_overall'] = float(line.split(": ")[1].strip())
            elif "Standard Deviation Fairness Score Overall:" in line:
                section_data['std_overall'] = float(line.split(": ")[1].strip())


            
            # elif "Fairness Score:" in line and ("Initial" in line or "Current" in line or "Final" in line):
            #     section_data["final_fairness"] = float(line.split(": ")[1].strip())
        
        return section_data

    class RealTimeOutputProcessor:
        def __init__(self, output_dir):
            self.output_dir = output_dir
            self.buffer = ""
            self.section_count = 0
            self.terminal = sys.stdout
            os.makedirs(output_dir, exist_ok=True)
        
        def write(self, message):
            self.terminal.write(message)
            self.buffer += message
            
            if "================================================================================\n" in self.buffer:
                self._process_sections()
        
        def flush(self):
            self.terminal.flush()
        
        def _process_sections(self):
            while "================================================================================\n" in self.buffer:
                section_end = self.buffer.find("================================================================================\n") + len("================================================================================\n")
                section = self.buffer[:section_end]
                self.buffer = self.buffer[section_end:]
                
                if "Detailed Fairness Score" in section and "FINAL RESULT" not in section:
                    self._save_section(section)
        
        def _save_section(self, section_text):
            try:
                iteration_data = process_section(section_text)
                if not iteration_data:
                    return
                    
                self.section_count += 1
                
                json_filename = f"fairness_data_{self.section_count:03d}.json"
                json_path = os.path.join(self.output_dir, json_filename)
                
                with open(json_path, 'w') as f:
                    json.dump(iteration_data, f, indent=4)
                
                print(f"\n[SAVED] Iteration {self.section_count} saved to: {json_filename}")
            except Exception as e:
                print(f"\n[ERROR] Failed to save section: {str(e)}")

    def run_optimization(obj):
        print("\nStarting optimization process...")
            
        # base_dir = os.path.join(os.path.expanduser("~"), "Desktop", "orari")
            
        # specific_folder = "university_schedules_stats"
            
        # output_dir = os.path.join(base_dir, specific_folder)

        base_dir = os.path.join(os.getcwd())
        specific_folder = "university_schedules_stats"
        # MODIFIED PATH
        output_dir = os.path.join(base_dir, 'FAST', specific_folder)


        try:
            os.makedirs(output_dir, exist_ok=True)
            print(f"\n[INFO] Created output directory: {output_dir}")
        except Exception as e:
            print(f"\n[ERROR] Failed to create directory: {str(e)}")
            return

        processor = RealTimeOutputProcessor(output_dir)
            
        original_stdout = sys.stdout
        sys.stdout = processor

        temp = 500
        finalTemp = 5
        alpha = 0.1
        perturb = 10
        hl=50
        sl=hl*2
        heu = True
        seed = 22
           
        #try:
        obj_base = perturbate_validity(obj)
        #               getBestSol_AMOSA(copy.deepcopy(obj_base), temp, finalTemp, alpha, perturb,hl,sl,heu,seed)
        best_solution = getBestSol_AMOSA_UI(copy.deepcopy(obj_base), temp, finalTemp, alpha, perturb,hl,sl,heu,seed,output_dir=output_dir)
        processor._process_sections()
        #except Exception as e:
        #    print(f"\n[ERROR] Optimization failed: {str(e)}")
        #finally:
        #    sys.stdout = original_stdout
            
        print(f"\nOptimization completed successfully!")
        print(f"Total files created: {processor.section_count}")
        print(f"All files saved in: {output_dir}")

    run_optimization(obj)

if __name__ == "__main__":
    main()

