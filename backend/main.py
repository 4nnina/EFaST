from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from model import DBManager, FAST, getDefaultResponse, TokenInput, LoginInput, UpdateInput, DeleteInput, BaseUserInfo, RegisterInfo, ExplainInfo, HTML_Placeholder
from logs.logConfig import logger
import os, uvicorn, dotenv, json, asyncio, signal
from glob import glob
from openai import OpenAI


app: FastAPI = FastAPI(
    title="FAST Python Backend",
    description="API documentation for FAST thesis project (UNIVR) (<a href='https://github.com/Fortu032/FAST_thesis' target='_blank'>This repo</a>) (<a href='https://github.com/4nnina/FAST-UI#' target='_blank'>Previous project</a>)",
    version="1.3.2"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"]
)


# Starts FAST Algorithm as a subprocess
def runFastAlg():

    import subprocess, shutil, sys

    outputDir: str = "FAST/university_schedules_stats/"
    mainScriptPath: str = os.path.abspath("FAST/src/main.py")

    shutil.rmtree(outputDir, ignore_errors=True)
    os.makedirs(outputDir, exist_ok=True)

    bgProcess = subprocess.Popen(
        [sys.executable, mainScriptPath],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=os.environ.copy()
    )
    os.environ["FAST_SUBPROCESS"] = str(bgProcess.pid)
    bgProcess.communicate()


# Asks ChatGPT to process data in order to get a parsable report
def getModelResponse(prompt: str) -> str:

    apiKey: str | None = os.getenv("GPT_KEY")
    if not apiKey:
        return getDefaultResponse(1)
    
    try:
        client = OpenAI(api_key=apiKey)
        response = client.chat.completions.create(
            model = os.getenv("GPT_MODEL"),
            messages = [
                {"role": "user", "content": prompt}
            ],
        )
        print(response.choices[0].message.content)
        return json.loads(response.choices[0].message.content)
    
    except Exception as e:
        return getDefaultResponse(2, e)



@app.get("/info", summary="Fetch user preferences from user name", tags=["Get user preferences"])
async def fetchInfo(user: str):
    result: dict = DBManager.getInfoFromUser(user)
    logger.info(f"[INFO] Fetching user ({user}) preferences.")
    return JSONResponse(
        status_code=200,
        content=result
    )


@app.get("/users", summary="Fetch all users base info, except admin", tags=["Get all users info"])
async def fetchUsers():
    result: list[dict] = DBManager.getAllUsers()
    logger.info("[USERS] Fetching all user basic info.")
    return JSONResponse(
        status_code=200,
        content=result
    )


@app.get("/getJsonFiles", summary="Collection of all FAST algorithm JSON result", tags=["Get JSON Files"])
async def getJsonFiles():
    output_dir: str = "FAST/university_schedules_stats/"
    files: list = sorted(glob(os.path.join(output_dir, 'fairness_data_*.json')))
    result: list = []
    for file in files:
        content: dict | None = None
        try:
            with open(file, 'r') as jf:
                content = json.load(jf)
        except Exception as e:
            content = None
        result.append({
            'filename': os.path.basename(file),
            'content': content,
            'timestamp': os.path.getmtime(file)
        })
    return JSONResponse(
        status_code=200,
        content=result
    )


@app.get("/getCSV", summary="Getting a CSV file with every constraints in", tags=["Get constraints of all professors"], response_class=FileResponse)
async def getCSV():
    csvFile: str = "constraint_professors.csv"
    csvPath: str = f"FAST/dataset/university/{csvFile}" 
    return FileResponse(
        path=csvPath,
        media_type="text/csv",
        filename=csvFile
    )


@app.get("/{everyPath:path}", summary="Main homepage HTML template", tags=["Homepage for backend"], response_class=HTMLResponse)
async def catchRoutes(everyPath: str):
    logger.debug("[HOMEPAGE] Route catcher, someone wants to see backend documentation.")
    return HTMLResponse(content=HTML_Placeholder())


@app.post("/auth", summary="Token authentication service (bcrypt)", tags=["Authentication"])
async def authenticate(data: TokenInput):
    result: tuple[bool, str] = DBManager.verifyAuthentication(data.token)
    if result[0]:
        logger.info(f"[AUTH] User {result[1]} is authenticated now.")
        return JSONResponse(
            status_code=200,
            content={"auth": True, "user": result[1]}
        )
    else:
        logger.warning(f"[AUTH] Session token {data.token} invalid: '{result[1]}'.")
        return JSONResponse(
            status_code=401,
            content={"auth": False, "error": result[1]}
        )


@app.post("/login", summary="User or admin login", tags=["Login into application"])
async def login(data: LoginInput):
    if DBManager.verifyCredentials(data.username, data.password):
        logger.info(f"[LOGIN] User {data.username} just logged succesfully.")
        return JSONResponse(
            status_code=200,
            content={"user": data.username, "token": DBManager.makeTokenSession(data.username)}
        )
    logger.warning(f"[LOGIN] User {data.username} failed to log in.")
    return JSONResponse(
        status_code=401,                # unauthorized error
        content={"error": "Invalid credentials"}
    )


@app.post("/register", summary="Register new user", tags=["Register into application"])
async def register(data: RegisterInfo):
    result: bool = DBManager.registerUser(data.user, data.passw, data.maxUnd, data.maxImp)
    if result:
        logger.info(f"[REGISTER] A new user ({data.user}) was registered succesfully.")
        return JSONResponse(
            status_code=200,
            content={"ok": True}
        )
    logger.warning(f"[REGISTER] A new user ({data.user}) failed to register.")
    return JSONResponse(
        status_code=409,
        content={"ok": False}
    )


@app.post("/runOptimization", summary="Start a new FAST optimization", tags=["Run optimization"])
async def runOptimization(background_tasks: BackgroundTasks):
    bgPid: int = int(os.environ.get("FAST_SUBPROCESS", -1))
    if bgPid!=-1:
        try:
            os.kill(bgPid, 0)
            os.kill(bgPid, signal.SIGKILL)
        except OSError:
            pass
        del os.environ["FAST_SUBPROCESS"]
    background_tasks.add_task(runFastAlg)
    return JSONResponse(
        status_code=200,
        content={"status": "started", "message": "Optimization running in background"}
    )


@app.post("/stopOptimization", summary="Stopping a running FAST optimization", tags=["Stop optimization"])
async def stopOptimization(): 
    bgPid: int = int(os.environ.get("FAST_SUBPROCESS", -1))
    if bgPid!=-1:
        try:
            os.kill(bgPid, 0)
            os.kill(bgPid, signal.SIGKILL)
        except OSError:
            pass
        del os.environ["FAST_SUBPROCESS"]
        return JSONResponse(
            status_code=200,
            content={"status": "stopped", "message": "Old optimization was stopped"}
        )
    return JSONResponse(
        status_code=200,
        content={"status": "ok", "message": "There was no optimization to stop"}
    )


@app.post("/explanation", summary="Getting data explanation by ChatGPT API", tags=["Get ChatGPT response"])
async def explanationData(data: ExplainInfo):
    prompt: str = data.prompt if data.prompt else "prompt-v1"
    expData: dict = FAST.getExplanationData(prompt)
    response: dict = await asyncio.to_thread(
        getModelResponse,
        expData["prompt"]["text"]
    )
    return JSONResponse(
        status_code=200,
        content = {
            "response": response,
            "prompt": expData["prompt"]["text"],
            "iteration": expData["assignments"].get("iteration", 0)
        } 
    )


@app.put("/update", summary="Update user timeslot preferences", tags=["Update user preferences"])
async def updateInfo(data: UpdateInput):
    result: dict = DBManager.getInfoFromUser(data.user)
    if not result:
        logger.info(f"[UPDATE] User {data.user} is absent.")
    DBManager.updateTimeslotsFromUserId(result["id"], data.timeslots)
    FAST.updateProfessorsConstraint()
    logger.warning(f"[UPDATE] Timeslots of user {data.user} were updated succesfully.")
    return JSONResponse(
        status_code=200,
        content={"message": "ok"}
    )


@app.put("/edit", summary="Edit user base info (user table)", tags=["Update user info"])
async def updateBaseInfo(data: BaseUserInfo):
    result: list[str] = DBManager.updateUserInfo(data.id, data.user, data.passw, data.maxUnd, data.maxImp)
    if not result:
        logger.info(f"[EDIT] Base info for {data.user} was updated succesfully.")
        return JSONResponse(
            status_code=200,
            content={"ok": True}
        )
    logger.warning(f"[EDIT] Impossible to edit base info for {data.user}, here's why: { ', '.join(result) }")
    return JSONResponse(
        status_code=200,
        content={"ok": False, "issues": result}
    )


@app.delete("/remove", summary="Delete user instance and its timeslot preferences", tags=["Delete everything for user"])
async def deleteInfo(data: DeleteInput):
    result: bool = DBManager.deleteUser(data.id)
    if result:
        logger.info(f"[REMOVE] User (id {data.id}) and his/her preferences were deleted succesfully.")
        return JSONResponse(
            status_code=200,
            content={"ok": True}
        )
    logger.error("[REMOVE] Impossible to remove 'admin'.")
    return JSONResponse(
        status_code=409,
        content={"ok": False}
    )



if __name__ == "__main__":
    dotenv.load_dotenv()
    port: int = 5000
    host: str = os.environ["HOST_INTERFACE"]
    uvicorn.run("main:app", host=host, port=port, reload=True)
