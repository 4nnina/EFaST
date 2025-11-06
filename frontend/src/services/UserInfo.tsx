import axios from "axios";

interface Timeslot {
    day: string,
    slot: [string, string], 
    weight: string
}

interface Info {
    id: number,
    maxImp: number,
    maxNot: number,
    timeslots: Timeslot[]
}

export async function getInfo(user: string): Promise<Info | null> {

    if (user=="nothing") { return null; }

    try {
        const response = await axios.get("http://localhost:5000/info", {
            params: {user}
        });
        return response.data as Info;
    } catch (error) {
        console.log("Error while fetching user info:", error);
        return null;
    }

}

export async function updateInfo(user: string, info: any) {

    if (!user || user=="nothing") { return; }

    try {
        await axios.put("http://localhost:5000/update", {
            user: user,
            timeslots: info.timeslots
        });
        alert("All your preferences were saved succesfully!")
    } catch (error) {
        console.log("Error while updating user info:", error);
    }

}

