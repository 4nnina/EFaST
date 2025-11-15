import { useEffect, useState, useRef } from "react";
import AdminAuth from "../services/AdminAuth";
import { runOptimization, stopOptimization, getJsonFiles } from "../services/OptAPI";
import { CalcPlot } from "../components/CalcPlot";

function CalcPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [latestData, setLatestData] = useState<any>(null);
  const prevLength = useRef<number>(0);

  const [avg, setAvg] = useState<number[]>([]);
  const [glb, setGlb] = useState<number[]>([]);

  // 🔁 Polling ogni 2 secondi per i file JSON
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

              // 🔢 Calcolo media fairness studenti
              let avgNum = 0;
              if (newest.content?.degrees) {
                const degrees = newest.content.degrees;
                const values: number[] = [];

                // Prende tutti i valori numerici direttamente
                Object.entries(degrees).forEach(([key, val]) => {
                  if (typeof val === "number") values.push(val);
                });

                if (values.length > 0) {
                  avgNum = values.reduce((a, b) => a + b, 0) / values.length;
                  avgNum = Math.round(avgNum * 100) / 100; // 2 decimali
                }
              }

              setAvg((avg) => [...avg, avgNum]);

              const glbNum = newest.content?.final_fairness || 0;
              setGlb((glb) => [...glb, Math.round(glbNum * 100) / 100]);
            }
            prevLength.current = data.length;
            setFiles(data);
          } else {
            console.warn("La risposta non è un array:", data);
          }
        } catch (err) {
          console.error("Errore nel polling:", err);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // ▶️ Avvia o ferma l’ottimizzazione
  const handleOptimizationToggle = async () => {
    try {
      if (!isRunning) {
        setLatestData(null);
        setFiles([]);
        prevLength.current = 0;
        setAvg([]);
        setGlb([]);

        setIsRunning(true);
        const res = await runOptimization();
        console.log(res.message || "Ottimizzazione avviata!");
      } else {
        const res = await stopOptimization();
        console.log(res.message || "Ottimizzazione fermata!");
        setIsRunning(false);
      }
    } catch (err) {
      console.error("Errore durante l'avvio/arresto:", err);
      setIsRunning(false);
    }
  };

  // 🔍 Funzioni di interpretazione dati
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
        if (!grouped[name]) grouped[name] = {};
        grouped[name][`Year ${year}`] = value;
      }
    });

    return grouped;
  };

  const tableData = getFairnessTable();

  // 📊 Calcoli derivati
  const totalProfessors = latestData?.professors?.length || 0;
  const unfairProfessors = latestData?.["Fairness < 100%"] || 0;
  const worstFairness = latestData?.["Worst Percentage"] || 0;
  const globalFairness = latestData?.final_fairness?.toFixed(2) || "0";

  // 📊 Calcola la media dei valori nella tabella Fairness by Year and Degree per display
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
      <div className="flex flex-col items-center gap-3">
        {/* Welcome title */}
        <div className="w-screen bg-gradient-to-r from-purple-500 via-blue-500 to-blue-300 p-8 text-center shadow-lg mb-2">
          <h1 className="text-4xl font-extrabold text-white">
            Perform calculation
          </h1>
        </div>

        {/* 📈 Risultati */}
        {latestData && (
          <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-md space-y-8">
            <h3 className="text-xl font-semibold text-center">
              Optimization Results
            </h3>

            {/* 🔢 Tabella con le tre fairness principali */}
            <div className="flex justify-center">
              <table className="border border-gray-300 text-sm rounded-xl">
                <tbody>
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
                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border font-semibold">
                      Student Class Average Fairness
                    </td>
                    <td className="px-4 py-2 border">{fairnessAvg}</td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border font-semibold">
                      Global Fairness
                    </td>
                    <td className="px-4 py-2 border">{globalFairness}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="h-[1px]"></div>

            {/* Indicator */}
            <div>
              <h4 className="font-semibold text-center mb-2">
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
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="h-[1px]"></div>

            {/* Tabella Fairness by Year and Degree */}
            <div>
              <h4 className="font-semibold text-center mb-3">
                Fairness by Year and Degree
              </h4>
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
                            const val = years[year];
                            const bgColor =
                              val === undefined
                                ? ""
                                : val >= -20
                                ? "bg-green-100"
                                : "bg-orange-100";
                            return (
                              <td key={year} className={`p-2 border ${bgColor}`}>
                                {val !== undefined ? val.toFixed(2) : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📊 Plot AVG e GLB */}
            {(avg.length > 0 || glb.length > 0) && (
              <div className="mt-6">
                <CalcPlot avg={avg} glb={glb} />
              </div>
            )}
          </div>
        )}
        <div className="h-[1px]"></div>

        {/* 🔘 Bottone e stato in fondo */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={handleOptimizationToggle}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
              isRunning
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isRunning ? "STOP OPTIMIZATION" : "RUN NEW OPTIMIZATION"}
          </button>

          <div className="text-center">
            <p>📂 Number of iterations: {files.length}</p>
            <p>
              🕓 State:{" "}
              <span
                className={`font-semibold ${
                  isRunning ? "text-green-600" : "text-gray-500"
                }`}
              >
                {isRunning ? "Running" : "Stopped"}
              </span>
            </p>
          </div>
        </div>
      </div><br/><br/>
    </AdminAuth>
  );
}

export default CalcPage;
