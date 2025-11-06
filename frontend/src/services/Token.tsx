import axios from "axios";

interface User {
    auth: boolean,
    user?: string,
    error?: string
}

async function getToken(): Promise<User | null> {

    const token = localStorage.getItem("FastToken");

    if (!token) return null;

    try {
        const response = await axios.post("http://localhost:5000/auth", {token});
        return response.data as User;
    } catch (error) {
        console.log("Error during token authentication:", error);
        return null;
    }

}

export default getToken;