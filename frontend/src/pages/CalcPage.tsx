import { useEffect, useState, useRef } from "react";
import AdminAuth from "../services/AdminAuth";
import { runOptimization, stopOptimization, getJsonFiles } from "../services/OptAPI";
import { CalcPlot } from "../components/CalcPlot";
import RunPopup from "../components/RunPopup";
import ExplainPopup from "../components/ExplainPopup";
import Navbar from "../components/Navbar";

function CalcPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runState, setRunState] = useState<"stopped" | "running" | "completed">("stopped");

  const [latestData, setLatestData] = useState<any>(null);
  const prevLength = useRef<number>(0);

  const [avgProf, setAvgProf] = useState<number[]>([]);
  const [avgDegree, setAvgDegree] = useState<number[]>([]);
  const [avgOverall, setAvgOverall] = useState<number[]>([]);  
  
  const [isRunPopupOpen, setIsRunPopupOpen] = useState(false);
  const [stopConfig, setStopConfig] = useState<{ type: "iterations"; value: number } | null>(null);
  const [expectedEnd, setExpectedEnd] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning) {
      interval = setInterval(async () => {
        try {
          const data = await getJsonFiles();

          if (Array.isArray(data)) {
            if (data.length > prevLength.current) {
              const newest = data[data.length - 1];
              setLatestData(newest.content || null);

              // Process all files to build complete trend arrays
              const allAvgProf: number[] = [];
              const allAvgDegree: number[] = [];
              const allAvgOverall: number[] = [];

              data.forEach((file) => {
                const avgProfVal = file.content?.avg_prof || 0;
                allAvgProf.push(Math.round(avgProfVal * 100) / 100);

                const avgDegreeVal = file.content?.avg_degree || 0;
                allAvgDegree.push(Math.round(avgDegreeVal * 100) / 100);

                const avgOverallVal = file.content?.avg_overall || 0;
                allAvgOverall.push(Math.round(avgOverallVal * 100) / 100);
              });

              setAvgProf(allAvgProf);
              setAvgDegree(allAvgDegree);
              setAvgOverall(allAvgOverall);

            }

            prevLength.current = data.length;
            setFiles(data);
            
            // Set latestData to the last file within the limit
            const limitedFiles = stopConfig ? data.slice(0, stopConfig.value) : data;
            if (limitedFiles.length > 0) {
              setLatestData(limitedFiles[limitedFiles.length - 1]?.content || null);
            }
          }
        } catch (err) {
          console.error("Errore nel polling:", err);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);


  const handleOptimizationToggle = async () => {
    try {
      if (!isRunning) {
        // Reset
        setLatestData(null);
        setFiles([]);
        prevLength.current = 0;
        setAvgProf([]);
        setAvgDegree([]);
        setAvgOverall([]); 

        setIsRunning(true);
        setRunState("running");

        await runOptimization();
      } else {
        await stopOptimization();
        setIsRunning(false);
        setRunState("stopped");
      }
    } catch (err) {
      console.error("Errore durante avvio/arresto:", err);
      setIsRunning(false);
      setRunState("stopped");
    }
  };


  const handleStartWithConfig = async (config: { type: "iterations"; value: number }) => {
    setIsRunPopupOpen(false);
    setStopConfig(config);

    const n = config.value;
    const totalSeconds = n * 0.09;

    const endDate = new Date(Date.now() + totalSeconds * 1000);
    const formatted =
      endDate.getHours().toString().padStart(2, "0") +
      ":" +
      endDate.getMinutes().toString().padStart(2, "0");

    setExpectedEnd(formatted);
    handleOptimizationToggle();
  };


  useEffect(() => {
    if (!isRunning || !stopConfig) return;

    if (files.length >= stopConfig.value) {
      stopOptimization();
      setIsRunning(false);
      setRunState("completed");
    }
  }, [isRunning, stopConfig, files.length]);


  const getFairnessTable = () => {
    if (!latestData?.degrees) return null;

    const degrees = latestData.degrees;
    const degreeMap: any = {
      Bio: "Biotechnology",
      Inf: "Computer Science",
      BioInf: "Bioinformatics",
    };

    const grouped: Record<string, any> = {};

    Object.entries(degrees).forEach(([key, value]) => {
      const match = key.match(/year (\d) (\w+)/);
      if (match) {
        const [_, year, code] = match;
        const name = degreeMap[code];
        if (!grouped[name]) {
          grouped[name] = { code }; // Store the code for later use
        }
        grouped[name][`Year ${year}`] = value;
      }
    });

    return grouped;
  };

  const tableData = getFairnessTable();

  // Limit displayed data to stopConfig.value
  const displayedAvgProf = stopConfig ? avgProf.slice(0, stopConfig.value) : avgProf;
  const displayedAvgDegree = stopConfig ? avgDegree.slice(0, stopConfig.value) : avgDegree;
  const displayedAvgOverall = stopConfig ? avgOverall.slice(0, stopConfig.value) : avgOverall;
  const displayedFiles = stopConfig ? files.slice(0, stopConfig.value) : files;
  
  // Get latest data from limited files
  const limitedLatestData = stopConfig && displayedFiles.length > 0 ? displayedFiles[displayedFiles.length - 1]?.content : latestData;

  const totalProfessors = limitedLatestData?.professors?.length || 0;
  const unfairProfessors = limitedLatestData?.['Fairness < 100%'] || 0;
  const worstFairness = limitedLatestData?.['Worst Percentage'] || 0;
  const globalFairness = limitedLatestData?.final_fairness?.toFixed(2) || '0';
  const AVGglobalFairness = limitedLatestData?.avg_overall?.toFixed(2) || '-';
  const STDglobalFairness = limitedLatestData?.std_overall?.toFixed(2) || '-';
  const AVGFairnessStud = limitedLatestData?.avg_degree?.toFixed(2) || '-';
  const STDFairnessStud = limitedLatestData?.std_degree?.toFixed(2) || '-';
  const AVGFairnessProf = limitedLatestData?.avg_prof?.toFixed(2) || '-';
  const STDFairnessProf = limitedLatestData?.std_prof?.toFixed(2) || '-';

  // Average fairness (local)
  let fairnessAvg = "-";
  if (tableData) {
    const values: number[] = [];
    Object.values(tableData).forEach((years: any) => {
      Object.values(years).forEach((val: any) => {
        if (typeof val === "number") values.push(val);
      });
    });
    if (values.length > 0) {
      fairnessAvg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    }
  }


  return (
    <AdminAuth>
      <Navbar />
      <div className="flex flex-col items-center gap-3">

        {/* title */}
        <div className="w-screen bg-gradient-to-r from-purple-500 via-blue-500 to-blue-300 p-8 text-center shadow-lg mb-2">
          <h1 className="text-4xl font-extrabold text-white">Perform calculation</h1>
        </div>

        {/* Status Panel */}
        {stopConfig && (
          <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-md mt-6 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* State */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 font-medium">State</p>
                <p
                  className={`text-xl font-bold mt-1 ${
                    runState === "running"
                      ? "text-green-600"
                      : runState === "completed"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {runState === "running"
                    ? "Running"
                    : runState === "completed"
                    ? "Completed"
                    : "Stopped"}
                </p>
              </div>

              {/* Iterations */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Iterations</p>
                <p className="text-xl font-bold mt-1 text-gray-800">
                  {displayedFiles.length} / {stopConfig.value}
                </p>
              </div>

              {/* End time */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 font-medium">Expected End Time</p>
                <p className="text-xl font-bold mt-1 text-gray-800">
                  {expectedEnd || "-"}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Results - Show as soon as data is available */}
        {(latestData || avgProf.length > 0) && (
          <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-md space-y-8">
            <h3 className="text-xl font-semibold text-center mt-6 mb-4">Optimization Results</h3>

            {/* Main stats */}
            <div className="flex justify-center">
              <table className="border border-gray-300 text-sm rounded-xl">
                <tbody>

                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border font-semibold">Global Fairness &lang;g<sub>a</sub>(A), g<sub>s</sub>(A)&rang;</td>
                    <td className="px-4 py-2 border">({AVGglobalFairness},{STDglobalFairness})</td>
                  </tr>

                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border font-semibold">Professor Fairness (AVG, STD)</td>
                    <td className="px-4 py-2 border">({AVGFairnessProf}, {STDFairnessProf})</td>
                  </tr>

                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border font-semibold">Student Cohort Fairness (AVG, STD)</td>
                    <td className="px-4 py-2 border">({AVGFairnessStud}, {STDFairnessStud})</td>
                  </tr>

                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border font-semibold">
                      Professors with {'<'} 100% Fairness
                    </td>
                    <td className="px-4 py-2 border">
                      {unfairProfessors}/{totalProfessors} (
                      {totalProfessors > 0
                        ? ((unfairProfessors / totalProfessors) * 100).toFixed(1)
                        : "0.0"}
                      %)
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Worst fairness */}
            <div>
              <hr />
              <h4 className="font-semibold text-center mb-2 mt-6">
                Professor Worst Fairness Indicator
              </h4>

              <div className="relative w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute top-[-6px] text-red-500"
                  style={{ left: `${worstFairness}%` }}
                >
                  ▲
                </div>
              </div>

              <div className="flex justify-between text-sm mt-1 text-gray-500">
                <span>0%</span><span>25%</span><span>50%</span>
                <span>75%</span><span>100%</span>
              </div>
            </div>

            {/* Fairness by degree */}
            <div>
              <hr />
              <h4 className="font-semibold text-center mb-3 mt-6">Fairness by Year and Degree</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm text-center rounded-xl">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Degree</th>
                      <th className="p-2 border">1st Year</th>
                      <th className="p-2 border">2nd Year</th>
                      <th className="p-2 border">3rd Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData &&
                      Object.entries(tableData).map(([degree, years]: any) => (
                        <tr key={degree} className="odd:bg-white even:bg-gray-50">
                          <td className="p-2 border font-semibold">{degree}</td>
                          {["Year 1", "Year 2", "Year 3"].map((year) => {
                            const yearNum = year.match(/\d+/)?.[0];
                            return (
                              <td
                                key={year}
                                onClick={() => {
                                  if (years[year] !== undefined && years.code) {
                                    // Pass the degree code (Bio, Inf, BioInf) and just the year number
                                    window.open(`/fairness/${encodeURIComponent(years.code)}/${encodeURIComponent(yearNum || "1")}?fairness=${years[year]}`, "_blank");
                                  }
                                }}
                                className={`p-2 border cursor-pointer hover:bg-blue-100 transition ${
                                  years[year] !== undefined ? "hover:shadow-md" : ""
                                }`}
                              >
                                {years[year] !== undefined ? years[year].toFixed(2) : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plot */}
            {(displayedAvgProf.length > 0 || displayedAvgDegree.length > 0 || displayedAvgOverall.length > 0) && (
              <div className="mt-6 flex justify-center">
                <div className="w-full max-w-3xl">
                  <CalcPlot avg={displayedAvgProf} glb={displayedAvgDegree} profAvg={displayedAvgOverall} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* RUN / STOP BUTTON */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={() => {
              if (!isRunning) setIsRunPopupOpen(true);
              else handleOptimizationToggle();
            }}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
              isRunning ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isRunning ? "STOP OPTIMIZATION" : "RUN NEW OPTIMIZATION"}
          </button>
        </div>
      </div><br/><br/><br/>

      {/* Popup */}
      {isRunPopupOpen && (
        <RunPopup
          onClose={() => setIsRunPopupOpen(false)}
          onConfirm={handleStartWithConfig}
        />
      )}

      {limitedLatestData && <ExplainPopup />}

    </AdminAuth>
  );
}

export default CalcPage;
