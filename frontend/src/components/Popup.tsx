import { useState } from "react";

function Popup(props: any) {

    const mapDayToFullName = (day: string) => {
        const days: { [key: string]: string } = {
            Mon: 'Monday',
            Tue: 'Tuesday',
            Wed: 'Wednesday',
            Thu: 'Thursday',
            Fri: 'Friday',
            Sat: 'Saturday',
            Sun: 'Sunday',
        };
        return days[day] || day;
    };

    function colorToPref(color: string): string {
        if (color === "bg-yellow-300") return "better_not";
        if (color === "bg-red-300") return "impossible";
        return "available";
    }

    function betterPref(pref: string): string {
        if (pref === "better_not") return "Better Not";
        if (pref === "impossible") return "Impossible";
        return "Available";
    }

    const yellowRemaining = props.yellows;
    const redRemaining = props.reds;

    const [selectedPref, setSelectedPref] = useState<string>("choose");
    const isDisabled = selectedPref === "choose";

    return (
        <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
            onClick={() => props.close()} // 🔹 chiude cliccando sullo sfondo
        >
            <div
                className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full"
                onClick={(e) => e.stopPropagation()} // 🔹 evita chiusura cliccando dentro
            >
                <p className="text-left text-lg mb-4">
                    <strong>Time:</strong> {props.hour1} - {props.hour2}<br />
                    <strong>Day:</strong> {mapDayToFullName(props.day)}<br />
                    <strong>Current setting:</strong> {betterPref(colorToPref(props.state))}
                </p>

                <div className="mb-6">
                    <label htmlFor="preferences" className="block text-left text-lg font-semibold mb-2">
                        New preference:
                    </label>

                    <select
                        id="preferences"
                        name="preferences"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                        value={selectedPref}
                        onChange={(e) => setSelectedPref(e.target.value)}
                    >
                        <option value="choose" disabled>
                            Choose an option
                        </option>

                        <option value="available" className="bg-blue-200 hover:bg-blue-300">
                            Available
                        </option>

                        {yellowRemaining > 0 && (
                            <option value="better_not" className="bg-yellow-200 hover:bg-yellow-300">
                                Better Not
                            </option>
                        )}

                        {redRemaining > 0 && (
                            <option value="impossible" className="bg-red-200 hover:bg-red-300">
                                Impossible
                            </option>
                        )}
                    </select>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() =>
                            props.close(
                                colorToPref(props.state),
                                selectedPref,
                                props.hour1,
                                props.hour2,
                                props.day
                            )
                        }
                        disabled={isDisabled}
                        className={`px-6 py-2 rounded-lg shadow-md font-semibold transition duration-200 
                            ${
                                isDisabled
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Popup;
