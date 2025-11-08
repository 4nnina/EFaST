import { useState } from "react";
import AdminAuth from "../services/AdminAuth";
import AdminTable from "../components/AdminTable";
import RegisterPopup from "../components/RegPopup";
import { registerUser } from "../services/UserInfo";

function AdminPage() {
  // 👇 tipi validi solo per i campi che vuoi usare nei filtri
  type UserField = "id" | "name";

  const [orderBy, setOrderBy] = useState<UserField>("id");
  const [searchBy, setSearchBy] = useState<UserField>("name");
  const [searchValue, setSearchValue] = useState("");
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  function logout() {
    localStorage.removeItem("FastToken");
    window.location.href = "/login";
  }

  function register() {
    setShowRegisterPopup(true); // apre popup
  }

  async function handleRegisterClose(newUser?: { name: string; password: string; mxUnd: number; mxImp: number }) {
    
    setShowRegisterPopup(false);

    if (newUser) {
      try {
        const response = await registerUser(newUser.name, newUser.password, newUser.mxUnd, newUser.mxImp);
        if (response.ok) {
          alert("User registered successfully!");
          window.location.href = "/dashboard";
        } else {
          alert("User " + newUser.name + " already exists.");
        }
      } catch (err) {
        alert("Error while registering " + newUser.name + ".");
      }
    }

  }

  function perform() {
    window.location.href = "/calculate";
  }

  return (
    <AdminAuth>
      {/* Header */}
      <div className="w-screen bg-gradient-to-r from-purple-500 via-blue-500 to-blue-300 p-8 text-center shadow-lg mb-2">
        <h1 className="text-4xl font-extrabold text-white">
          Here's your dashboard
        </h1>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto flex flex-col items-center space-y-8 p-6">
        {/* Filter Box */}
        <div className="w-full border border-gray-300 rounded-lg shadow-md bg-white p-4 flex flex-wrap gap-6 justify-center items-center">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">Order by:</span>
            <select
              className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value as UserField)}
            >
              <option value="id">Id</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">Search by:</span>
            <select
              className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as UserField)}
            >
              <option value="id">Id</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">With:</span>
            <input
              type="text"
              placeholder={`Type a ${searchBy.toLowerCase()}...`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Table */}
        <AdminTable
          orderBy={orderBy}
          searchField={searchBy}
          searchValue={searchValue}
        />

        {/* Buttons */}
        <div className="flex gap-6 justify-center">
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200"
          >
            Logout
          </button>

          <button
            onClick={register}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200"
          >
            Register user
          </button>

          <button
            onClick={perform}
            className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200"
          >
            Perform calculation
          </button>
        </div>
      </div>

      {/* Register Popup */}
      {showRegisterPopup && <RegisterPopup close={handleRegisterClose} />}
    
    </AdminAuth>
  );
}

export default AdminPage;
