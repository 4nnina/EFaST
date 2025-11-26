import { useState } from "react";

interface RunPopupProps {
  onConfirm: (config: { type: "iterations"; value: number }) => void;
  onClose: () => void;
}

export default function RunPopup({ onConfirm }: RunPopupProps) {
  const [iterationValue, setIterationValue] = useState(5);

  const isIntPositive = (n: number) => Number.isInteger(n) && n > 0;
  const isValid = isIntPositive(iterationValue);

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({ type: "iterations", value: iterationValue });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Run Optimization</h2>

        {/* ITERATION INPUT */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Iterations:</label>

          <input
            type="number"
            min={1}
            value={iterationValue}
            onChange={(e) => setIterationValue(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-600"
          />

          {!isValid && (
            <p className="text-red-500 text-sm mt-1">
              Please enter a positive whole number.
            </p>
          )}
        </div>

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
