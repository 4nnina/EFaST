
export interface Auth {
    auth: boolean,
    user?: string,
    error?: string
}

interface Timeslot {
    day: string,
    slot: [string, string], 
    weight: string
}

export interface Info {
    id: number,
    maxImp: number,
    maxNot: number,
    timeslots: Timeslot[]
}

export interface User {
    id: number,
    name: string,
    mxUnd: number,
    mxImp: number
}

export interface BaseResponse {
    ok: boolean,
    issues?: string[]
}