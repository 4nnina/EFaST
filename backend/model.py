from pydantic import BaseModel
from database.manager import Query, cout
import bcrypt, datetime as dt
import secrets, os, pandas as pd


def HTML_Placeholder() -> str:
    contentHTML: str = "<html><body>backend/index.html file not found.</body></html>"
    with open("index.html", "r") as homepage:
        contentHTML = homepage.read()
    return contentHTML


class TokenInput(BaseModel):
    token: str

class LoginInput(BaseModel):
    username: str
    password: str

class Timeslot(BaseModel):
    day: str
    slot: list[str, str]
    weight: str

class UpdateInput(BaseModel):
    user: str
    timeslots: list[Timeslot]

class RegisterInfo(BaseModel):
    user: str
    passw: str
    maxUnd: int
    maxImp: int

class BaseUserInfo(BaseModel):
    id: int
    user: str
    passw: str
    maxUnd: int
    maxImp: int

class DeleteInput(BaseModel):
    id: int


class DBManager:

    @staticmethod
    def verifyCredentials(user: str, password: str) -> bool:
        result: dict | None = Query.getInfoFromUser(user)
        if not result:
            return False
        return bcrypt.checkpw(password.encode("utf-8"), result["password"])
    
    @staticmethod
    def verifyAuthentication(token: str) -> tuple[bool, str]:
        result: dict | None = Query.getInfoBySessionToken(token)
        if not result:
            return (False, "This token doesn't exist")
        if dt.datetime.now().timestamp() <= result["scadenza"]:
            return (True, result["user"])
        return (False, "This token is expired")
    
    @staticmethod       # max 3 session at same time
    def makeTokenSession(user: str) -> str | None:
        tokens: list[dict] = Query.getSessionsFromUser(user)
        if len(tokens) >= 3:
            Query.deleteSessionToken(tokens[0]["token"])
        token: str = secrets.token_urlsafe(32)
        sessionTime: int = int(os.environ["SESSION_TIME"])  # 1 hour
        expiring: float = dt.datetime.now().timestamp() + sessionTime
        if Query.insertNewSession(user, token, expiring):
            return token
        return None
    
    @staticmethod
    def getInfoFromUser(user: str) -> dict:
        userInfo: dict = Query.getInfoFromUser(user)
        if not userInfo:
            return {
                "error": "No user was found."
            }
        result: list[dict] = Query.getTimeslotsFromId(userInfo["id"])
        return {
            "id": userInfo["id"],
            "maxImp": userInfo["maximp"],
            "maxNot": userInfo["maxnot"],
            "timeslots": [ {
                "day": row["giorno"],
                "slot": [row["ora_inizio"], row["ora_fine"]],
                "weight": row["peso"]
            } for row in result ]
        }

    @staticmethod
    def updateTimeslotsFromUserId(userId: int, timeslots: list[Timeslot]) -> None:
        Query.deleteSlotsFromUserId(userId)
        for s in timeslots:
            timeslot: dict = dict(s)
            Query.insertSlotsForUserId(userId, timeslot["day"], timeslot["slot"], timeslot["weight"])

    @staticmethod
    def getAllUsers() -> list[dict]:
        result: dict[list] = Query.getAllUsersInfo()
        table: list[dict] = []
        for row in result:
            table.append({
                "id": row["id"],
                "name": row["username"],
                "mxUnd": row["maxnot"],
                "mxImp": row["maximp"]
            })
        return table
    
    """
    Future edit constraints
    # check if user preferences are compatible with maxnot and maxNOT
        

    """

    @staticmethod
    def registerUser(name: str, password: str, maxnot: int, maxNOT: int) -> bool:
        user: dict = Query.getInfoFromUser(name)
        if user:
            return False
        encpsw: str = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        Query.insertUser(name, encpsw, maxnot, maxNOT)
        return True
    
    @staticmethod
    def deleteUser(userId: int) -> bool:
        if userId==0:
            return False
        if Query.deleteUserPreferencesFromId(userId) > 0:
            FAST.updateProfessorsConstraint()
        Query.deleteUserInfoFromId(userId)
        return True
    
    @staticmethod
    def updateUserInfo(userId: int, user: str, password: str, maxnot: int, maxNOT: int) -> bool:

        if user=="admin" or maxnot<0 or maxNOT<0:
            return False
        
        if user!="X":
            if Query.isNamePresent(user) == 1:
                return False

        count: list[dict] = list(Query.getMaxCountFromUser(userId))
        max_n: int = 0
        max_N: int = 0

        if len(count)==1:
            if count[0]["peso"]=="not":
                max_n = count[0]["count"]
            else:
                max_N = count[0]["count"]
        elif len(count)==2:
            max_n = count[0]["count"]
            max_N = count[1]["count"]  

        # cout(f"{max_n}>{maxnot} or {max_N}>{maxNOT}")

        if max_n > maxnot or max_N > maxNOT:
            return False

        if password!="X":
            encpsw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        else:
            encpsw = None

        Query.updateUserInfo(userId, user, encpsw, int(maxnot), int(maxNOT))
        return True


class FAST:

    @staticmethod
    def updateProfessorsConstraint() -> None:
        csvFile: str = "FAST/dataset/university/constraint_professors.csv"
        dataFrame = pd.read_csv(csvFile, nrows=0)
        result: list[dict] = Query.getAllTimeslots()
        for ts in result:
            nts: dict = {
                "prof_id": ts["id"],
                "week_day": ts["giorno"],
                "hour_begin": str(ts["ora_inizio"]),
                "hour_end": str(ts["ora_fine"]),
                "level": "undesired" if ts["peso"]=="not" else "impossible",
                "note": "",
                "constraint": f"{ts['peso']} ({ts['giorno']}, [{ts['ora_inizio']},{ts['ora_fine']}])"
            }
            dataFrame = pd.concat([dataFrame, pd.DataFrame([nts])], ignore_index=True)
        dataFrame.to_csv(csvFile, index=False)