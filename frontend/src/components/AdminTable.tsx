import { useEffect, useState } from "react";
import { getUsers } from "../services/UserInfo";
import type { User } from "../services/UserInfo";
import EditPopup from "./EditPopup"; 

interface AdminTableProps {
  orderBy: keyof User;
  searchField: keyof User;
  searchValue: string;
}

function AdminTable({ orderBy, searchField, searchValue }: AdminTableProps) {
  const [data, setData] = useState<User[]>([]);
  const [displayedData, setDisplayedData] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null); // stato popup

  useEffect(() => {
    async function fetchUsers() {
      const data: User[] = await getUsers();
      setData(data);
    }
    fetchUsers();
  }, []);

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

  function handleCalendar(item: User) {
    window.location.href = "/preferences/" + item.name;
  }

  function handleEdit(item: User) {
    setEditingUser(item); 
  }

  // funzione per chiudere popup e aggiornare dati
  function closePopup(
    updatedUser?: { name: string; mxUnd: number; mxImp: number },
    deleted?: boolean
  ) {

    if (editingUser) {

      if (deleted) {

        // delete case (...)
        
      } else if (updatedUser) {

        // edit case (...)

      }
    }

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
        <EditPopup user={editingUser} close={closePopup} />
      )}
    </div>
  );
}

export default AdminTable;
