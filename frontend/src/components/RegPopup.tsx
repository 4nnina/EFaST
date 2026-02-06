import { useState } from "react";

interface RegisterPopupProps {
  close: (newUser?: { name: string; password: string; mxUnd: number; mxImp: number }) => void;
}

export default function RegisterPopup({ close }: RegisterPopupProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mxUnd, setMxUnd] = useState(10);
  const [mxImp, setMxImp] = useState(10);

  const isValid = name.trim() !== "" && password.trim() !== "" && mxUnd > 0 && mxImp > 0;

  const handleRegister = () => {
    if (!isValid) return;
    close({ name, password, mxUnd, mxImp });
  };

  const handleCancel = () => {
    close();
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Register New User</h2>

        {/* NAME INPUT */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Username:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter username"
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* PASSWORD INPUT */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* MX UND INPUT */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Max Better Not:</label>
          <input
            type="number"
            min={1}
            value={mxUnd}
            onChange={(e) => setMxUnd(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* MX IMP INPUT */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Max Impossible:</label>
          <input
            type="number"
            min={1}
            value={mxImp}
            onChange={(e) => setMxImp(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 justify-end mt-6">
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRegister}
            disabled={!isValid}
            className={`px-6 py-2 rounded-lg font-semibold shadow-md transition
              ${
                isValid
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
