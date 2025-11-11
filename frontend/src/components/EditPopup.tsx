import { useState, useEffect } from "react";
import type { EditPopupProps } from "../types/PopupTypes";

function EditPopup({ user, onEdit, onDelete, onClose }: EditPopupProps) {
  const [name, setName] = useState("");
  const [mxUnd, setMxUnd] = useState(user.mxUnd);
  const [mxImp, setMxImp] = useState(user.mxImp);
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Validazione: nome alfanumerico + underscore, max >= 0, password obbligatoria min 4 char
  useEffect(() => {
    const nameValid = (/^[\w]+$/.test(name) && name.length >= 4) || name.length == 0;
    const mxUndValid = Number.isInteger(mxUnd) && mxUnd >= 0;
    const mxImpValid = Number.isInteger(mxImp) && mxImp >= 0;
    const passwordValid = password.length >= 4 || password.length == 0;
    setIsValid(nameValid && mxUndValid && mxImpValid && passwordValid);
  }, [name, mxUnd, mxImp, password]);

  const handleEdit = () => {
    if (!isValid) return;
    onEdit({ id: user.id, name, mxUnd, mxImp, password });
  };

  const handleDelete = () => {
    onDelete(user.id);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-left text-lg mb-4">
          <strong>Edit user:</strong> {user.name}
        </p>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-left font-semibold mb-1">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leave blank to ignore"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-left font-semibold mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to ignore"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Max Better Not */}
        <div className="mb-4">
          <label className="block text-left font-semibold mb-1">Max Better Not:</label>
          <input
            type="number"
            value={mxUnd}
            onChange={(e) => setMxUnd(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            min={0}
          />
        </div>

        {/* Max Impossible */}
        <div className="mb-6">
          <label className="block text-left font-semibold mb-1">Max Impossible:</label>
          <input
            type="number"
            value={mxImp}
            onChange={(e) => setMxImp(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            min={0}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleDelete}
            className="px-6 py-2 rounded-lg shadow-md font-semibold bg-red-600 text-white hover:bg-red-700"
          >
            Delete User
          </button>

          <button
            onClick={handleEdit}
            disabled={!isValid}
            className={`px-6 py-2 rounded-lg shadow-md font-semibold transition duration-200
              ${
                isValid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPopup;
