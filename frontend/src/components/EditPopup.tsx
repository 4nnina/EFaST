import { useState, useEffect } from "react";

// !!!! checkare nel backend che non esista un name uguale
// e che i max siano coerenti con il calendar !!!!

interface EditPopupProps {
  user: {
    id: number;
    name: string;
    mxUnd: number;
    mxImp: number;
  };
  close: (updatedUser?: { name: string; mxUnd: number; mxImp: number }, deleted?: boolean) => void;
}

function EditPopup({ user, close }: EditPopupProps) {
  const [name, setName] = useState(user.name);
  const [mxUnd, setMxUnd] = useState(user.mxUnd);
  const [mxImp, setMxImp] = useState(user.mxImp);
  const [isValid, setIsValid] = useState(false);

  // Validazione: nome alfanumerico + underscore, max >= 0
  useEffect(() => {
    const nameValid = /^[\w]+$/.test(name);
    const mxUndValid = Number.isInteger(mxUnd) && mxUnd >= 0;
    const mxImpValid = Number.isInteger(mxImp) && mxImp >= 0;
    setIsValid(nameValid && mxUndValid && mxImpValid);
  }, [name, mxUnd, mxImp]);

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
          <strong>Edit user:</strong> {user.name}
        </p>

        <div className="mb-4">
          <label className="block text-left font-semibold mb-1">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

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

        <div className="flex justify-between">
          <button
            onClick={() => close(undefined, true)}
            className="px-6 py-2 rounded-lg shadow-md font-semibold bg-red-600 text-white hover:bg-red-700"
          >
            Delete User
          </button>

          <button
            onClick={() => close({ name, mxUnd, mxImp })}
            disabled={!isValid}
            className={`px-6 py-2 rounded-lg shadow-md font-semibold transition duration-200
              ${isValid
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
