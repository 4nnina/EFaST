from sqlalchemy import select, update, insert, delete, func, case, ForeignKey, PrimaryKeyConstraint, Engine, Table, Column, Integer, String, BigInteger, MetaData, create_engine

metadata: MetaData = MetaData()

users: Table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String),
    Column("password", String),
    Column("maximp", Integer,),
    Column("maxnot", Integer)
)

slot: Table = Table(
    "slot",
    metadata,
    Column("id", Integer),
    Column("giorno", String),
    Column("ora_inizio", String),
    Column("ora_fine", String),
    Column("peso", String),
    PrimaryKeyConstraint("id", "giorno", "ora_inizio", "ora_fine")
)

sessions: Table = Table(
    "sessions",
    metadata,
    Column("user", String, ForeignKey("users.username"), nullable=False),
    Column("token", String, primary_key=True),
    Column("scadenza", BigInteger, nullable=False)
)

engine: Engine = create_engine("sqlite:///database/db.sqlite3")


class Query:

    @staticmethod
    def getInfoFromUser(name: str) -> dict | None:
        with engine.connect() as conn:
            query = select(users).where(
                users.c["username"] == name
            )
            return conn.execute(query).mappings().first()

    @staticmethod
    def getInfoBySessionToken(token: str) -> dict | None:
        with engine.connect() as conn:
            query = select(sessions).where(
                sessions.c["token"] == token
            )
            return conn.execute(query).mappings().first()

    @staticmethod
    def getSessionsFromUser(user: str) -> list[dict]:
        with engine.connect() as conn:
            query = select(sessions).where(
                sessions.c["user"] == user
            ).order_by(
                sessions.c["scadenza"]
            )
            return conn.execute(query).mappings().all()

    @staticmethod
    def insertNewSession(user: str, token: str, expiring: float) -> bool:
        with engine.begin() as conn:
            query = insert(sessions).values(
                user = user,
                token = token,
                scadenza = expiring
            )
            return conn.execute(query).rowcount == 1

    @staticmethod
    def deleteSessionToken(token: str) -> bool:
        with engine.begin() as conn:
            query = delete(sessions).where(
                sessions.c["token"] == token
            )
            return conn.execute(query).rowcount == 1

    @staticmethod
    def getTimeslotsFromId(userId: int) -> list[dict]:
        with engine.connect() as conn:
            query = select(slot).where(
                slot.c["id"] == userId
            )
            return conn.execute(query).mappings()

    @staticmethod
    def getAllTimeslots() -> list[dict]:
        with engine.connect() as conn:
            query = select(slot).order_by(
                slot.c.id, slot.c.giorno, slot.c.ora_inizio
            )
            return conn.execute(query).mappings()
        
    @staticmethod
    def deleteSlotsFromUserId(userId: int) -> None:
        cout(userId)
        with engine.begin() as conn:
            query = delete(slot).where(
                slot.c["id"] == userId
            )
            conn.execute(query)

    @staticmethod
    def insertSlotsForUserId(userId: int, day: str, slotTime: list[str, str], weight: str) -> None:
        with engine.begin() as conn:
            query = insert(slot).values(
                id = userId,
                giorno = day,
                ora_inizio = slotTime[0],
                ora_fine = slotTime[1],
                peso = weight
            )
            conn.execute(query)

    @staticmethod
    def getAllUsersInfo():
        with engine.connect() as conn:
            query = select(users).where(
                users.c["id"] != 0
            )
            return conn.execute(query).mappings()
        
    @staticmethod
    def getMaxCountFromUser(userId: int):
        with engine.connect() as conn:
            query = (
                select(
                    slot.c["peso"],
                    func.count().label("count")
                )
                .where(
                    slot.c["id"] == userId
                ).group_by(
                    slot.c["peso"]
                ).order_by(
                    case(
                        (slot.c["peso"] == 'not', 0),
                        (slot.c["peso"] == 'NOT', 1),
                        else_=2
                    )
                )
            )
            return conn.execute(query).mappings()
        
    @staticmethod
    def insertUser(user: str, passw: str, maxnot: int, maxNOT: int):
        with engine.begin() as conn:
            query = users.insert().values(
                username=user,
                password=passw,
                maximp=maxNOT,
                maxnot=maxnot
            )
            conn.execute(query)

    @staticmethod
    def deleteUserPreferencesFromId(userId: int) -> int:
        with engine.begin() as conn:
            query = delete(slot).where(
                slot.c["id"] == userId
            )
            return conn.execute(query).rowcount

    @staticmethod
    def deleteUserInfoFromId(userId: int) -> None:
        with engine.begin() as conn:
            query = delete(users).where(
                users.c["id"] == userId
            )
            conn.execute(query)

    @staticmethod
    def updateUserInfo(userId: int, user: str, passw: str | None, maxnot: int, maxNOT: int):
        with engine.begin() as conn:
            if user!="X" and passw:
                query = update(users).where(
                    users.c["id"] == userId
                ).values(
                    username=user,
                    password=passw,
                    maximp=maxNOT,
                    maxnot=maxnot
                )
            elif user=="X" and passw:
                query = update(users).where(
                    users.c["id"] == userId
                ).values(
                    maximp=maxNOT,
                    maxnot=maxnot
                )
            elif user!="X" and not passw:
                query = update(users).where(
                    users.c["id"] == userId
                ).values(
                    username=user,
                    maximp=maxNOT,
                    maxnot=maxnot
                )
            else:
                query = update(users).where(
                    users.c["id"] == userId
                ).values(
                    maximp=maxNOT,
                    maxnot=maxnot
                )
            conn.execute(query)

    def isNamePresent(user: str) -> int:
        with engine.connect() as conn:
            query = select(users).where(
                users.c["username"] == user
            )
            return conn.execute(query).rowcount


# debug printer on file stdout
def cout(obj: any):
    with open("cout.txt", "a") as file:
        file.write(str(obj) + "\n")

'''
with engine.connect() as conn:
    conn.execute(
        update(users).values(password=bcrypt.hashpw("ciaone".encode("utf-8"), bcrypt.gensalt()))
    )
    conn.commit()
'''
