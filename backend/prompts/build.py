import json

# this script does not provide anything to the backend logic
# it's used only to generate a well-formatted prompt

# Run this file from its main directory

promptName: str = "" 
promptName = input("Which prompt do you want to build up? ") if promptName=="" else promptName

fairnessNumber: str = ""
fairnessNumber = input("Which fairness data do you want to use? ") if fairnessNumber=="" else fairnessNumber

with open(promptName, "r") as file:
	promptContent: str = file.read()
	
JSONPATH: str = "../FAST/university_schedules_stats"

with open(f"{JSONPATH}/constraints.json", "r") as file:
	constraints: dict = json.load(file)

with open(f"{JSONPATH}/assignments.json", "r") as file:
	assignments: dict = json.load(file)
	
with open(f"{JSONPATH}/conflicts.json", "r") as file:
	conflicts: dict = json.load(file)
	
with open(f"{JSONPATH}/fairness_data_{fairnessNumber}.json", "r") as file:
	fairnessData: dict = json.load(file)
	
promptComplete: str = promptContent.format(constraints, assignments, conflicts, fairnessData)

with open("result.txt", "w") as file:
	file.write(promptComplete)
