import { useEffect, useState } from "react";
import { deleteUser, editUser, getUsers } from "../services/UserAPI";
import EditPopup from "./EditPopup"; 
import type { User } from "../types/UserTypes";
import type { AdminTableProps } from "../types/PopupTypes";

function AdminTable({ orderBy, searchField, searchValue }: AdminTableProps) {
  const [data, setData] = useState<User[]>([]);
  const [displayedData, setDisplayedData] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null); // stato popup

  // --- FETCH iniziale ---
  useEffect(() => {
    async function fetchUsers() {
      const users: User[] = await getUsers();
      setData(users);
    }
    fetchUsers();
  }, []);

  // --- FILTRAGGIO + ORDINAMENTO ---
  useEffect(() => {
    const handler = setTimeout(() => {
      let filtered = [...data];

      if (searchValue.trim() !== "") {
        filtered = filtered.filter((item) =>
          item[searchField]
            ?.toString()
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        );
      }

      filtered.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        return Number(aValue) - Number(bValue);
      });

      setDisplayedData(filtered);
    }, 200);

    return () => clearTimeout(handler);
  }, [data, orderBy, searchField, searchValue]);

  // --- FUNZIONI DI CONTROLLO ---
  function handleCalendar(item: User) {
    window.open(`${window.location.origin}/preferences/${item.name}`, "_blank");
  }

  function handleEdit(item: User) {
    setEditingUser(item); 
  }

  // 🔹 Quando l’utente salva le modifiche
  function handleEditUser(updatedUser: { id: number; name?: string; mxUnd: number; mxImp: number; password?: string }) {
    
    async function removeUser(){

      const response = await editUser(updatedUser.id, updatedUser.name || "X", updatedUser.password || "X", updatedUser.mxUnd, updatedUser.mxImp)
      if (response.ok) {
        alert("User info and preferences have been modified succesfully")
        window.location.href = "/dashboard";
      } else {
        const issues = response.issues || []
        alert(
          "❌ Something went wrong while editing user ID " + updatedUser.id + "." +
          "\n\nFound issues:\n- " + issues.join("\n- ")
        );
      }

    }

    removeUser();
    setEditingUser(null);

  }

  // 🔹 Quando l’utente elimina
  async function handleDeleteUser(userId: number) {

    async function removeUser(){

      const response = await deleteUser(userId)
      if (response.ok) {
        alert("User info and preferences have been deleted succesfully")
        window.location.href = "/dashboard";
      } 
      alert("Something went wrong while deleting userId " + userId);

    }

    removeUser();
    setEditingUser(null);

  }

  // 🔹 Quando chiude senza fare nulla
  function handleClosePopup() {
    setEditingUser(null);
  }

  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
      <div className="h-[600px] overflow-y-auto">
        <table className="w-full text-center border-collapse">
          <thead className="bg-gray-200 text-gray-700 sticky top-0">
            <tr>
              <th className="p-3 border border-gray-300">Id</th>
              <th className="p-3 border border-gray-300 min-w-[110px]">User</th>
              <th className="p-3 border border-gray-300 max-w-[110px]">Max Better Not</th>
              <th className="p-3 border border-gray-300 max-w-[110px]">Max Impossible</th>
              <th className="p-3 border border-gray-300"></th>
              <th className="p-3 border border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {displayedData.length > 0 ? (
              displayedData.map((item) => (
                <tr
                  key={item.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <td className="p-3 border border-gray-300">{item.id}</td>
                  <td className="p-3 border border-gray-300">{item.name}</td>
                  <td className="p-3 border border-gray-300">{item.mxUnd}</td>
                  <td className="p-3 border border-gray-300">{item.mxImp}</td>
                  <td
                    className="p-3 border border-gray-300 cursor-pointer select-none"
                    onClick={() => handleEdit(item)}
                  >
                    ⚙️
                  </td>
                  <td
                    className="p-3 border border-gray-300 cursor-pointer select-none"
                    onClick={() => handleCalendar(item)}
                  >
                    📅
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-gray-500 italic border border-gray-300"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditPopup
          user={editingUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

export default AdminTable;
