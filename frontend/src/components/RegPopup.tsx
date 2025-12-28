import { useState, useEffect } from "react";
import type { RegisterPopupProps } from "../types/PopupTypes";

function RegPopup({ close }: RegisterPopupProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mxUnd, setMxUnd] = useState(10);
  const [mxImp, setMxImp] = useState(10);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const nameValid = /^[\w]+$/.test(name) && name.length>=4;
    const passwordValid = password.length>=4;
    const mxUndValid = Number.isInteger(mxUnd) && mxUnd >= 0;
    const mxImpValid = Number.isInteger(mxImp) && mxImp >= 0;
    setIsValid(nameValid && passwordValid && mxUndValid && mxImpValid);
  }, [name, password, mxUnd, mxImp]);

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
      onClick={() => close()}
    >
      <div
        className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-left text-lg mb-4">
          <strong>Register new user</strong>
        </p>

        <div className="mb-4">
          <label className="block text-left font-semibold mb-1">Username:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="mb-4">
          <label className="block text-left font-semibold mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="mb-4">
          <label className="block text-left font-semibold mb-1">Max Better Not:</label>
          <input
            type="number"
            value={mxUnd}
            onChange={(e) => setMxUnd(Number(e.target.value))}
            min={0}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="mb-6">
          <label className="block text-left font-semibold mb-1">Max Impossible:</label>
          <input
            type="number"
            value={mxImp}
            onChange={(e) => setMxImp(Number(e.target.value))}
            min={0}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => close({ name, password, mxUnd, mxImp })}
            disabled={!isValid}
            className={`px-6 py-2 rounded-lg shadow-md font-semibold transition duration-200
              ${isValid
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegPopup;
