import axios from "axios";
import type { BaseResponse, Info, User } from "../types/UserTypes";

export async function getInfo(user: string) {

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

export async function getUsers() {

    try {
        const response = await axios.get("http://localhost:5000/users");
        return response.data as User[];
    } catch (error) {
        console.log("Error while fetching all user info:", error);
        return [] as User[];
    }

}

export async function registerUser(name: string, password: string, mxUnd: number, mxImp: number) {

    try {
        const response = await axios.post("http://localhost:5000/register", {
            user: name,
            passw: password,
            maxUnd: mxUnd,
            maxImp: mxImp
        });
        return response.data as BaseResponse;
    } catch (error) {
        console.log("Error while fetching all user info:", error);
        return {
            ok: false
        } as BaseResponse;
    }

}

export async function deleteUser(userId: number) {

    try {
        const response = await axios.delete("http://localhost:5000/remove", {
            data: {id: userId}
        });
        return response.data as BaseResponse;
    } catch (error) {
        console.log("Error while deleting user info:", error);
        return {
            ok: false
        } as BaseResponse;
    }

}

export async function editUser(userId: number, name: string, password: string, mxUnd: number, mxImp: number) {

    try {
        const response = await axios.put("http://localhost:5000/edit", {
            id: userId,
            user: name,
            passw: password,
            maxUnd: mxUnd,
            maxImp: mxImp
        });
        return response.data as BaseResponse;
    } catch (error) {
        console.log("Error while deleting user info:", error);
        return {
            ok: false
        } as BaseResponse;
    }

}

