import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminAuth from "../services/AdminAuth";
import { API_BASE_URL } from "../config";
import Navbar from "../components/Navbar";

interface TimelineData {
  degree: string;
  year: number;
  schedule: {
    mon: (string | null)[];
    tue: (string | null)[];
    wed: (string | null)[];
    thu: (string | null)[];
    fri: (string | null)[];
  };
  fairness_score: number;
}

interface ModuleMapping {
  [key: string]: string;
}

interface ProfessorConflict {
  prof_id: number;
  better_not_unsatisfied: string[];
}

interface ConflictData {
  iteration: number;
  conflicts: ProfessorConflict[];
}

function FairnessDetailPage() {
  const { degree, year } = useParams();
  const navigate = useNavigate();
  const [fairnessValue, setFairnessValue] = useState<number | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduleMapping, setModuleMapping] = useState<ModuleMapping>({});
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);

  console.log("🔗 Route params received:", { degree, year, degreeType: typeof degree, yearType: typeof year });

  const days = ["mon", "tue", "wed", "thu", "fri"];
  const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const hours = ["8-9", "9-10", "10-11", "11-12", "12-13", "13-14", "14-15", "15-16", "16-17", "17-18", "18-19"];

  const degreeNameMap: Record<string, string> = {
    "Bio": "Biotechnology",
    "Inf": "Computer Science",
    "BioInf": "Bioinformatics"
  };

  const getDegreeName = (code: string | undefined): string => {
    if (!code) return "Unknown";
    return degreeNameMap[code] || code;
  };

  const transformSlot = (slot: string | null): string | null => {
    if (!slot) return null;
    try {
      const parts = slot.split("by");
      if (parts.length < 2) return slot;
      const moduleId = parts[0].trim();
      const profPart = parts[1].trim();
      const profId = profPart.split("-")[0];
      
      // Try both string and integer lookups
      let moduleName = moduleMapping[moduleId] || moduleMapping[parseInt(moduleId)] || null;
      
      if (!moduleName) {
        console.warn(`Module ID ${moduleId} not found in mapping. Available IDs:`, Object.keys(moduleMapping).slice(0, 5));
        moduleName = `Module_${moduleId}`;
      }
      
      const result = `${moduleName} (Prof ${profId})`;
      console.debug(`Transformed ${slot} to ${result}`);
      return result;
    } catch (err) {
      console.error(`Error transforming slot ${slot}:`, err);
      return slot;
    }
  };

  const hasConflict = (slot: string | null, dayIdx: number, hourIdx: number): boolean => {
    if (!slot || !conflictData) return false;
    
    try {
      // Extract professor ID from slot (format: "89by46-2")
      const parts = slot.split("by");
      if (parts.length < 2) return false;
      const profPart = parts[1].trim();
      const profId = parseInt(profPart.split("-")[0]);
      
      // Find conflicts for this professor
      const profConflict = conflictData.conflicts.find(c => c.prof_id === profId);
      if (!profConflict || profConflict.better_not_unsatisfied.length === 0) {
        return false;
      }
      
      // Map day index and hour index to conflict format
      // Days: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4
      // Hours: 8-9=0, 9-10=1, ..., 18-19=10
      const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven"];
      const dayName = dayNames[dayIdx];
      const startHour = 8 + hourIdx;
      const endHour = startHour + 1;
      
      // Check if this time slot is in the conflict list
      // Format in conflicts.json: "Gio 14:30-15:30"
      const conflictString = `${dayName} ${startHour}:00-${endHour}:00`;
      const conflictString2 = `${dayName} ${startHour}:30-${endHour}:30`; // Alternative format
      
      const hasConflictInList = profConflict.better_not_unsatisfied.some(c => 
        c.includes(dayName) && c.includes(`${startHour}:`) && c.includes(`${endHour}:`)
      );
      
      console.debug(`Checking conflict for prof ${profId} at ${dayName} ${startHour}:00 - hasConflict: ${hasConflictInList}`);
      return hasConflictInList;
    } catch (err) {
      console.error(`Error checking conflict for slot ${slot}:`, err);
      return false;
    }
  };

  useEffect(() => {
    // Load module mapping from API
    const fetchModuleMapping = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/module-mapping`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const mapping = await response.json();
        console.log(`✓ Loaded module mapping from API, entries: ${Object.keys(mapping).length}`);
        console.log("Sample entries:", Object.entries(mapping).slice(0, 5));
        setModuleMapping(mapping);
      } catch (err) {
        console.error("Failed to load module mapping from API:", err);
      }
    };

    fetchModuleMapping();
  }, []);

  useEffect(() => {
    // Load conflicts data from API
    const fetchConflicts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/conflicts`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data: ConflictData = await response.json();
        console.log(`✓ Loaded conflicts data, iteration: ${data.iteration}, professors: ${data.conflicts.length}`);
        setConflictData(data);
      } catch (err) {
        console.error("Failed to load conflicts data from API:", err);
      }
    };

    fetchConflicts();
  }, []);

  useEffect(() => {
    // Fetch timeline allocation data
    const fetchTimelineData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const fairness = params.get("fairness");
        if (fairness) {
          setFairnessValue(parseFloat(fairness));
        }

        const response = await fetch(`${API_BASE_URL}/latest-timeline`);
        if (!response.ok) throw new Error("Failed to fetch timeline data");
        
        const data = await response.json();
        console.log("📊 Full timeline data received with keys:", Object.keys(data));
        console.log(`🔍 Looking for degree code: "${degree}", year number: ${year}`);
        
        // Build the expected key: degree code + " year " + year number
        // e.g., "Bio year 1", "Inf year 2", "BioInf year 3"
        const expectedKey = `${degree} year ${year}`;
        console.log(`🔑 Expected key: "${expectedKey}"`);
        
        if (data[expectedKey]) {
          console.log(`✅ Found matching data for key: "${expectedKey}"`);
          setTimelineData(data[expectedKey]);
        } else {
          console.error(`❌ No data found for key: "${expectedKey}"`);
          console.error("📋 Available keys:", Object.keys(data));
          setTimelineData(null);
        }
      } catch (error) {
        console.error("❌ Error fetching timeline data:", error);
        setTimelineData(null);
      } finally {
        setLoading(false);
      }
    };

    if (degree && year) {
      fetchTimelineData();
    } else {
      console.warn("⚠️ degree or year is missing", { degree, year });
      setLoading(false);
    }
  }, [degree, year]);

  return (
    <AdminAuth>
      <Navbar />
      <div className="flex flex-col items-center gap-3">
        
        {/* Header */}
        <div className="w-screen bg-gradient-to-r from-purple-500 via-blue-500 to-blue-300 p-8 text-center shadow-lg mb-2">
          <h1 className="text-4xl font-extrabold text-white">Timetable Details</h1>
          <p className="text-white mt-2">{getDegreeName(degree)} - Year {year}</p>
        </div>

        {/* Content */}
        <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-md mt-6">
          
          {/* Fairness Score */}
          {fairnessValue !== null && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Student Cohort Fairness</p>
              <p className="text-3xl font-bold text-blue-600">{fairnessValue.toFixed(2)}</p>
            </div>
          )}

          {/* Legend */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend</h4>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <span className="inline-block bg-green-200 text-green-800 px-3 py-1 rounded text-xs font-semibold">Sample</span>
                <span className="text-sm text-gray-600">Professor preferences satisfied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block bg-red-200 text-red-800 px-3 py-1 rounded text-xs font-semibold">Sample</span>
                <span className="text-sm text-gray-600">Professor preferences not satisfied</span>
              </div>
            </div>
          </div>

          {/* Weekly Calendar */}
          <h3 className="text-xl font-semibold mb-4">Weekly Schedule</h3>
          
          {loading ? (
            <p className="text-center text-gray-500">Loading schedule...</p>
          ) : timelineData ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2">Time</th>
                    {dayLabels.map((day) => (
                      <th key={day} className="border border-gray-300 p-2 text-sm font-semibold">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((hour, hourIdx) => (
                    <tr key={hour} className="odd:bg-white even:bg-gray-50">
                      <td className="border border-gray-300 p-2 font-semibold text-sm">{hour}</td>
                      {days.map((day) => {
                        const slot = timelineData.schedule[day as keyof typeof timelineData.schedule][hourIdx];
                        const conflict = hasConflict(slot, days.indexOf(day), hourIdx);
                        const bgColor = conflict ? "bg-red-200" : "bg-green-200";
                        const textColor = conflict ? "text-red-800" : "text-green-800";
                        
                        return (
                          <td
                            key={`${day}-${hour}`}
                            className="border border-gray-300 p-2 text-sm text-center"
                          >
                            {slot && (
                              <span className={`inline-block ${bgColor} ${textColor} px-2 py-1 rounded text-xs font-semibold`}>
                                {transformSlot(slot)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No schedule data available</p>
          )}

        </div>

        {/* Back Button 
        <div className="mt-6 mb-10">
          <button
            onClick={() => navigate("/calculate")}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Back to Calculation
          </button>
        </div>
        */}

      </div>
    </AdminAuth>
  );
}

export default FairnessDetailPage;
