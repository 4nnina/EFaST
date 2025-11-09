from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from model import DBManager, FAST, TokenInput, LoginInput, UpdateInput, DeleteInput, BaseUserInfo, RegisterInfo, HTML_Placeholder
from logs.logConfig import logger
import os, uvicorn, dotenv
from database.manager import cout


app: FastAPI = FastAPI(
    title="FAST Backend API",
    description="FastAPI backend documentation for F.A.S.T. thesis project (UNIVR)",
    version="1.0.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"]
)


@app.post("/auth", summary="Token authentication", tags=["Authentication"])
async def authenticate(data: TokenInput):
    result: tuple[bool, str] = DBManager.verifyAuthentication(data.token)
    if result[0]:
        logger.info(f"User {result[1]} is authenticated now.")
        return JSONResponse(
            status_code=200,
            content={"auth": True, "user": result[1]}
        )
    else:
        logger.warning(f"Session token {data.token} is invalid or expired.")
        return JSONResponse(
            status_code=401,
            content={"auth": False, "error": result[1]}
        )


@app.post("/login", summary="User or admin login", tags=["Login"])
async def login(data: LoginInput):
    if DBManager.verifyCredentials(data.username, data.password):
        logger.info(f"User {data.username} just logged succesfully.")
        return JSONResponse(
            status_code=200,
            content={"user": data.username, "token": DBManager.makeTokenSession(data.username)}
        )
    logger.warning(f"User {data.username} failed to log in.")
    return JSONResponse(
        status_code=401,                # unauthorized error
        content={"error": "Invalid credentials"}
    )


@app.post("/register", summary="Register new user", tags=["Register"])
async def register(data: RegisterInfo):
    result: bool = DBManager.registerUser(data.user, data.passw, data.maxUnd, data.maxImp)
    if result:
        return JSONResponse(
            status_code=200,
            content={"ok": True}
        )
    return JSONResponse(
        status_code=409,
        content={"ok": False}
    )


@app.get("/info", summary="Fetch user preferences from user name", tags=["Get user preferences"])
async def fetchInfo(user: str):
    result: dict = DBManager.getInfoFromUser(user)
    return JSONResponse(
        status_code=200,
        content=result
    )


@app.get("/users", summary="Fetch all users base info, except admin", tags=["Get all users info"])
async def fetchUsers():
    result: list[dict] = DBManager.getAllUsers()
    return JSONResponse(
        status_code=200,
        content=result
    )


@app.put("/update", summary="Update user preferences", tags=["Update user preferences"])
async def updateInfo(data: UpdateInput):
    result: dict = DBManager.getInfoFromUser(data.user)
    if not result:
        logger.info(f"User {data.user} is absent.")
    DBManager.updateTimeslotsFromUserId(result["id"], data.timeslots)
    FAST.updateProfessorsConstraint()
    logger.info(f"Timeslots of user {data.user} were update succesfully.")
    return JSONResponse(
        status_code=200,
        content={"message": "ok"}
    )


@app.delete("/remove", summary="Delete user instance and his/her preferences", tags=["Delete all of user"])
async def deleteInfo(data: DeleteInput):
    result: bool = DBManager.deleteUser(data.id)
    if result:
        return JSONResponse(
            status_code=200,
            content={"ok": True}
        )
    return JSONResponse(
        status_code=409,
        content={"ok": False}
    )


@app.put("/edit", summary="Edit user base info", tags=["Update user info"])
async def updateBaseInfo(data: BaseUserInfo):
    result: bool = DBManager.updateUserInfo(data.id, data.user, data.passw, data.maxUnd, data.maxImp)
    if result:
        return JSONResponse(
            status_code=200,
            content={"ok": True}
        )
    return JSONResponse(
        status_code=409,
        content={"ok": False}
    )


@app.get("/{everyPath:path}", summary="Main homepage HTML template", tags=["Homepage"], response_class=HTMLResponse)
async def catchRoutes(everyPath: str):
    return HTMLResponse(content=HTML_Placeholder())


if __name__ == "__main__":
    dotenv.load_dotenv()
    port: int = int(os.environ["FASTAPI_PORT"])  
    host: str = os.environ["HOST_INTERFACE"]
    uvicorn.run("main:app", host=host, port=port, reload=True)
