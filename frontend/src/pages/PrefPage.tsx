import { useParams } from "react-router-dom";
import AdminAuth from "../services/AdminAuth";

function PrefPage() {

  const params = useParams();
  const user = params["*"]; 

  return (
    <AdminAuth>
        <div>Preferences for: {user}</div>
    </AdminAuth>
  )

}

export default PrefPage;