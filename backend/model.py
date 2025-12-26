from pydantic import BaseModel
from database.manager import Query
from logs.logConfig import logger
import bcrypt, datetime as dt, json
import secrets, os, pandas as pd


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

class ExplainInfo(BaseModel):
    prompt: str


def HTML_Placeholder() -> str:
    contentHTML: str = "<html><body>backend/index.html file not found.</body></html>"
    with open("index.html", "r") as homepage:
        contentHTML = homepage.read()
    return contentHTML


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
        sessionTime: int = int(os.environ["SESSION_TIME"])  
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
    def updateUserInfo(userId: int, user: str, password: str, maxnot: int, maxNOT: int) -> list:

        issues: list[str] = []

        if user=="admin":
            issues.append("Admin is not editable")
        if maxnot<0 or maxNOT<0:
            issues.append("Max input values must be integers")
        if user!="X":
            if Query.isNamePresent(user):
                issues.append(f"Username {user} is already taken")

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

        if max_n > maxnot or max_N > maxNOT:
            issues.append(f"Max input values are lower than actual preferences of userId {userId}")

        if issues:
            return issues
        
        if password!="X":
            encpsw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        else:
            encpsw = None

        Query.updateUserInfo(userId, user, encpsw, int(maxnot), int(maxNOT))
        return []


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
                "constraint": f"{ts['peso']} ({ts['giorno']}, [{ts['ora_inizio']}, {ts['ora_fine']}])"
            }
            dataFrame = pd.concat([dataFrame, pd.DataFrame([nts])], ignore_index=True)
        dataFrame.to_csv(csvFile, index=False)
        logger.info(f"[FAST] File '{csvFile}' was updated succesfully.")

    @staticmethod
    def getExplanationData(prompt: str):
        
        jsonPath: str = "FAST/university_schedules_stats"
        iterStr: str = "001"

        jsonFiles = len(os.listdir(jsonPath))
        iter = jsonFiles - 3

        if 1 <= iter and iter <= 9:
            iterStr = f"00{iter}"
        elif 10 <= iter and iter <= 99:
            iterStr = f"0{iter}"
        elif 100 <= iter and iter <= 999:
            iterStr = f"{iter}"

        def jd(jsonData: dict) -> str:
            return json.dumps(jsonData, separators=(",", ":"))

        with open(f"prompts/{prompt}.md", "r") as file:
            mainText: str = file.read()
        with open(f"{jsonPath}/constraints.json", "r") as file:
            j1: dict = json.load(file)
        with open(f"{jsonPath}/assignments.json", "r") as file:
            j2: dict = json.load(file)
        with open(f"{jsonPath}/conflicts.json", "r") as file:
            j3: dict = json.load(file)
        with open(f"{jsonPath}/fairness_data_{iterStr}.json", "r") as file:
            j4: dict = json.load(file)
        promptRes: str = mainText.format(jd(j1), jd(j2), jd(j3), jd(j4))

        return {
            "constraints": j1,
            "assignments": j2,
            "conflicts": j3,
            "fairness_data": j4,
            "prompt": {
                "source": prompt,
                "text": promptRes
            }
        }
        

def getDefaultResponse(choice: int = 1, arg = None) -> dict:
    match choice:
        case 1:
            return {"report_title":"AI Explanation unavailable","summary":"The AI explanation service could not be executed due to a configuration issue.","sections":[{"id":"config-error","title":"Configuration error","content_blocks":[{"type":"highlight_box","severity":"error","title":"Missing API token","text":"The backend could not find a valid **ChatGPT API key**. This prevents the AI explanation module from running."},{"type":"bullet_list","items":["The environment variable **GPT_KEY** is not set","The AI service is currently disabled","No optimization data was processed by the LLM"]},{"type":"paragraph","text":"Please ensure that the API key is correctly configured in the backend environment before retrying."}]}]}
        case 2:
            return {"report_title":"AI Explanation failed","summary":"An unexpected error occurred while generating the AI explanation.","sections":[{"id":"runtime-error","title":"Execution error","content_blocks":[{"type":"highlight_box","severity":"warning","title":"AI processing error","text":"The AI service encountered an error while processing the explanation request. This may be due to connectivity issues, API limits, or temporary service unavailability."},{"type":"paragraph","text":"The following error message was returned by the backend:"},{"type":"highlight_box","severity":"info","title":"Technical details","text":f"**{arg}**"},{"type":"paragraph","text":"You may retry the request later or consult the backend logs for further diagnostics."}]}]}
        case _:
            return dict()