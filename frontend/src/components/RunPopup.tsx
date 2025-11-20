import { useState } from "react";

interface RunPopupProps {
  onConfirm: (config: { type: "time" | "iterations"; value: number }) => void;
  onClose: () => void;
}

export default function RunPopup({ onConfirm }: RunPopupProps) {
  const [mode, setMode] = useState<"time" | "iterations">("time");
  const [timeValue, setTimeValue] = useState(60);
  const [timeUnit, setTimeUnit] = useState<"seconds" | "minutes" | "hours">(
    "seconds"
  );
  const [iterationValue, setIterationValue] = useState(5);

  // -------- VALIDAZIONE --------
  const isIntPositive = (n: number) => Number.isInteger(n) && n > 0;

  const isValid =
    mode === "time"
      ? isIntPositive(timeValue)
      : isIntPositive(iterationValue);

  // -------- CONVERSIONE TEMPO --------
  const convertToSeconds = () => {
    const map: Record<string, number> = {
      seconds: 1,
      minutes: 60,
      hours: 3600
    };
    return timeValue * map[timeUnit];
  };

  // -------- CONFERMA --------
  const handleConfirm = () => {
    if (!isValid) return;

    if (mode === "time") {
      onConfirm({ type: "time", value: convertToSeconds() });
    } else {
      onConfirm({ type: "iterations", value: iterationValue });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Run Optimization</h2>

        {/* SELECTOR */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Stop Condition:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-600"
          >
            <option value="time">After a time period</option>
            <option value="iterations">After a number of iterations</option>
          </select>
        </div>

        {/* TIME MODE */}
        {mode === "time" && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Time:</label>

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={timeValue}
                onChange={(e) => setTimeValue(Number(e.target.value))}
                className="w-1/2 px-3 py-2 border rounded-lg focus:ring-blue-600"
              />

              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value as any)}
                className="w-1/2 px-3 py-2 border rounded-lg focus:ring-blue-600"
              >
                <option value="seconds">seconds</option>
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
              </select>
            </div>

            {!isIntPositive(timeValue) && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a positive whole number.
              </p>
            )}
          </div>
        )}

        {/* ITERATION MODE */}
        {mode === "iterations" && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Iterations:</label>
            <input
              type="number"
              min={1}
              value={iterationValue}
              onChange={(e) => setIterationValue(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-600"
            />

            {!isIntPositive(iterationValue) && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a positive whole number.
              </p>
            )}
          </div>
        )}

        {/* START BUTTON */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`px-8 py-2 rounded-lg font-semibold shadow-md transition
              ${
                isValid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
