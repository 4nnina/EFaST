import { useState, useEffect } from "react";
import Auth from "../services/Auth";
import getToken from "../services/Token";
import Timetable from "../components/Timetable";
import { getInfo, updateInfo} from "../services/UserAPI";
import Loading from "../components/Loading";
import Popup from "../components/Popup";

function HomePage() {

    const [user, setUser] = useState<string>("nothing");
    const [maxImp, setMaxImp] = useState<number>(10);
    const [maxNot, setMaxNot] = useState<number>(15);
    const [ts, setTs] = useState<any>(null)

    const [showPopup, setShowPopup] = useState<boolean>(false); 
    const [popupData, setPopupData] = useState<{ hour1: string; hour2: string; day: string; color: string } | null>(null); 

    function logoutFunction() {
        localStorage.removeItem("FastToken");
        window.location.href = "/login";
    }

    useEffect(() => {

        async function fetchToken() {

            const username = await getToken();

            if (!username || !username.auth) {
                setUser("null");
            } else {
                setUser(username.user || "null");
            }

        }

        fetchToken();

    }, []);

    useEffect(() => {

        async function fetchInfo() {

            const info = await getInfo(user);

            if (info) {

                const notCount = info.timeslots?.filter(ts => ts.weight === "not").length || 0;
                const NOTCount = info.timeslots?.filter(ts => ts.weight === "NOT").length || 0;

                setMaxImp(info.maxImp - NOTCount);
                setMaxNot(info.maxNot - notCount);

                setTs(info);
                
            }
            
        }

        fetchInfo();

    }, [user]);

    function tableHandler(hour1: string, hour2: string, day: string, color: string) {
        setPopupData({ hour1, hour2, day, color });
        setShowPopup(true);
    }

    function closePopup(oldState: string, newState: string, hour1: string, hour2: string, day: string) {

        setShowPopup(false);
        setPopupData(null);
        
        const copyTs = JSON.parse(JSON.stringify(ts));

        const index = ts.timeslots.findIndex(
            ( t: { day: string; slot: string[]; }) => t.day==day && t.slot[0]==hour1
        );

        if (newState == "better_not" && oldState == "available") {

            setMaxNot(maxNot - 1);

            copyTs.timeslots.push({
                day: day,
                slot: [hour1, hour2],
                weight: "not"
            });

        } else if (newState == "better_not" && oldState == "impossible") {
            
            setMaxImp(maxImp + 1);
            setMaxNot(maxNot - 1);

            copyTs.timeslots[index] = {
                day: day,
                slot: [hour1, hour2],
                weight: "not"
            }

        }

        if (newState == "impossible" && oldState == "available") {

            setMaxImp(maxImp - 1);

            copyTs.timeslots.push({
                day: day,
                slot: [hour1, hour2],
                weight: "NOT"
            });

        } else if (newState == "impossible" && oldState == "better_not") {
            
            setMaxImp(maxImp - 1);
            setMaxNot(maxNot + 1);

            copyTs.timeslots[index] = {
                day: day,
                slot: [hour1, hour2],
                weight: "NOT"
            }

        }
        
        if (newState == "available" && oldState == "better_not") {

            setMaxNot(maxNot + 1);
            copyTs.timeslots.splice(index, 1);

        } else if (newState == "available" && oldState == "impossible") {

            setMaxImp(maxImp + 1);
            copyTs.timeslots.splice(index, 1);

        }

        setTs(copyTs);

    }

    return (
        <Auth>

            {/* Welcome title */}
            <div className="w-screen bg-gradient-to-r from-purple-500 via-blue-500 to-blue-300 p-8 text-center shadow-lg mb-2">
                <h1 className="text-4xl font-extrabold text-white">
                    Welcome back, {user}!
                </h1>
            </div>

            {/* Centering */}
            <div className="max-w-5xl mx-auto p-6 flex flex-col items-center space-y-12">

                {/* Legend box above counters */}
                <div className="w-[90%] p-4 bg-gray-50 rounded-xl shadow-lg flex items-center gap-6 mx-auto">
                    <span className="font-bold text-gray-800">Legend:</span>
                    <div className="flex gap-4 items-center text-gray-700 ml-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-300 rounded border border-gray-300"></div>
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-300 rounded border border-gray-300"></div>
                            <span>Better not</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-300 rounded border border-gray-300"></div>
                            <span>Impossible</span>
                        </div>
                    </div>
                </div>

                {/* Swapped Red & Yellow counters */}
                <div className="flex gap-8 justify-center">
                    <p className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded-xl shadow-lg text-lg text-center">
                        Yellow cells remaining: <span className="font-bold"> { maxNot } </span>
                    </p>
                    <p></p>
                    <p className="bg-red-100 text-red-800 px-6 py-3 rounded-xl shadow-lg text-lg text-center">
                        Red cells remaining: <span className="font-bold"> { maxImp } </span>
                    </p>
                </div>

                {/* Timetable component */}
                <div className="w-full">
                    {ts && Array.isArray(ts.timeslots) ? (
                        <Timetable data={ts.timeslots} handler={tableHandler} />
                    ) : (
                        <Loading />
                    )}
                </div>


                {/* Logout & Save buttons */}
                <div className="flex gap-6 justify-center">
                    <button onClick={ logoutFunction } className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200">
                        Logout
                    </button>
                    <p></p>
                    <button onClick={ () => { updateInfo(user, ts); } } className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200">
                        Save preferences
                    </button>
                </div>

            </div>

            {/* Popup Modal */}
            {showPopup && popupData && (
                <Popup hour1={popupData.hour1} hour2={popupData.hour2} day={popupData.day} state={popupData.color.split(" ")[0] } close={closePopup} yellows={maxNot} reds={maxImp} />
            )}

        </Auth>
    );
}

export default HomePage;
