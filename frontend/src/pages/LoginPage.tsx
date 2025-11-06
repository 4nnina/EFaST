import { useState } from "react";
import axios, { isAxiosError } from "axios";

function LoginPage() {

    const [username, setUsername] = useState("prof1");
    const [password, setPassword] = useState("ciaone");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:5000/login", {
                username,
                password,
            });

            setMessage("✅ You're logged in!");

            if (response.data.token) {
                localStorage.setItem("FastToken", response.data.token);
            }

            setTimeout(() => {
                if (username == "admin") {
                    window.location.href = "/dashboard";
                } else {
                    window.location.href = "/homepage";
                }
            }, 250);

        } catch (error) {

            if (isAxiosError(error)) {
                setMessage(`❌ Error: ${error.response?.data?.message || "invalid credentials"}`);
            } else {
                setMessage("⚠️ Unknown error!");
            }

        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-400">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full max-w-md">
                <h1 className="text-3xl font-bold text-white text-center mb-8 drop-shadow-lg">
                    Welcome in FAST!
                </h1>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Username input */}
                    <div className="relative">
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder=" "
                            className="peer block w-full rounded-lg bg-white/70 px-4 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/90 transition"
                            required
                        />
                        <label
                            htmlFor="username"
                            className="absolute left-4 top-2 text-gray-700 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-700 peer-focus:text-sm"
                        >
                            Username
                        </label>
                    </div>

                    {/* Password input */}
                    <div className="relative">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder=" "
                            className="peer block w-full rounded-lg bg-white/70 px-4 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/90 transition"
                            required
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-4 top-2 text-gray-700 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-700 peer-focus:text-sm"
                        >
                            Password
                        </label>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95"
                    >
                        Login
                    </button>
                </form>

                {message && (
                    <p className="text-center text-white font-medium mt-6">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default LoginPage;
