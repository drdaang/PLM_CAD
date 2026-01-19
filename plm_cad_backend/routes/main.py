
from passlib.exc import UnknownHashError
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends,Form,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import oracledb
from core.users_funcs import create_users_table_if_not_exists, get_current_user_email
from auth.security import hash_password,verify_password
from core.users_funcs import get_user_by_email
from fastapi.openapi.utils import status_code_ranges
from core.parts_funcs import get_part_info_by_part_number, get_all_parts_with_revisions, upload_File_locally
from core.bom_funcs import get_all_parts_info, create_bom_details, get_bom_details_by_id
import os
from auth import security,create_token
from auth.security import ACCESS_TOKEN_EXPIRATION_MINS
from fastapi.responses import FileResponse

from models.bom_models import BomCreate

app= FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message":"hi"}

@app.post("/login")
def login(data:dict):

    print("login reached")
    email = data.get("email", "").strip().lower()
    password= data.get("password")

    print("hihi")

    query="""SELECT password
FROM user_table
WHERE LOWER(email) = :email
"""
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )
    cur = conn.cursor()

    db_password=""

    try:

        cur.execute(query,{"email":email})
        row=cur.fetchone()
        print(row)
        cur.execute("SELECT user, sys_context('USERENV','CON_NAME') FROM dual")
        print("CONNECTED AS:", cur.fetchone())

        cur.execute("""
        SELECT table_name
        FROM user_tables
        WHERE table_name = 'USER_TABLE'
        """)
        print("TABLES:", cur.fetchall())
        cur.execute("SELECT COUNT(*) FROM user_table")
        print("USER COUNT:", cur.fetchone())

        email = data.get("email", "")
        print("INPUT EMAIL:", repr(email))
        email = email.strip().lower()
        print("TRIMMED EMAIL:", repr(email))
        cur.execute("SELECT email, password FROM user_table")
        for r in cur.fetchall():
            print("DB row:", repr(r[0]), repr(r[1]))

        if row:
            db_password = row[0]
            # print("TYPE:", type(db_password))
            # print("REPR:", repr(db_password))

        try:
            if not verify_password(password,db_password):
                raise HTTPException(status_code=401,detail="Invalid credentials")
        except UnknownHashError:
            raise HTTPException(status_code=500,detail="Details error")

    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error.message)
        raise HTTPException(status_code=500, detail="Database error")

    cur.close()
    conn.close()

    # if not verify_password(password,db_password):
    #     raise HTTPException(status_code=401,detail="Not authenticated")

    access_token= create_token.create_access_token(
        data={"sub":email},
        expire_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRATION_MINS)
    )
    return {"token":access_token}

@app.post("/signup")
def signup(data: dict):
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )
    cur = conn.cursor()

    email = data.get("email", "").strip().lower()
    password = data.get("password")
    userName = data.get("username")  # FIXED
    # password=password[:72]


    if not email or not password or not userName:
        raise HTTPException(status_code=400, detail="Missing fields")


    password= hash_password(password)
    merge_sql = """
    MERGE INTO USER_TABLE u
    USING (SELECT :email email FROM dual) src
    ON (u.email = src.email)
    WHEN MATCHED THEN
        UPDATE SET
            u.username = :username,
            u.password = :password
    WHEN NOT MATCHED THEN
        INSERT (username, email, password)
        VALUES (:username, :email, :password)
    """

    try:
        cur.execute(merge_sql, {
            "username": userName,
            "email": email,
            "password": password
        })
        conn.commit()
    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error.message)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cur.close()
        conn.close()

    return {"message": "Signup successful"}

@app.post('/create-part')
def createPart(
    name:str = Form(...),
    partNumber:str = Form(...),
    description:str | None = Form(None),
    PartFile:UploadFile = File(...),
    email: str = Depends(get_current_user_email)
):

    file_values = upload_File_locally(PartFile,partNumber)
    original_name=file_values["original_name"]
    file_path= file_values["file_path"]
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )
    cur = conn.cursor()

    try:
        user = get_user_by_email(email)
        created_by = user[0]  # RAW user id

        # -------- INSERT PART --------
        parts_query = """
            MERGE INTO parts p
USING (
    SELECT 
        :name AS name,
        :part_number AS part_number,
        :created_by AS created_by
    FROM dual
) src
ON (p.part_number = src.part_number)
WHEN NOT MATCHED THEN
INSERT (
    id,
    name,
    part_number,
    created_by,
    created_at
)
VALUES (
    SYS_GUID(),
    src.name,
    src.part_number,
    src.created_by,
    SYSTIMESTAMP
)

        """

        # part_id_var = cur.var(oracledb.DB_TYPE_RAW)

        cur.execute(
            parts_query,
            {
                "name": name,
                "part_number": partNumber,
                "created_by": created_by,
            }
        )

        cur.execute(
            "SELECT id FROM parts WHERE part_number = :part_number",
            {"part_number": partNumber}
        )
        part_id = cur.fetchone()[0]

        # -------- INSERT REVISION --------
        revisions_query = """
            INSERT INTO PART_REVISIONS (
                ID,
                PART_ID,
                REVISION,
                NAME,
                DESCRIPTION,
                CREATED_BY,
                CREATED_AT,
                FILE_PATH,
                ORIGINAL_FILENAME
            ) VALUES (
                SYS_GUID(),
                :part_id,
                (
                    SELECT NVL(MAX(REVISION), 0) + 1
                    FROM PART_REVISIONS
                    WHERE PART_ID = :part_id         
                ),
                :name,
                :description,
                :created_by,
                SYSTIMESTAMP,
                :file_path,
                :original_name
            )
        """

        cur.execute(
            revisions_query,
            {
                "part_id": part_id,
                "name": name,
                "description": description,
                "created_by": created_by,
                "file_path": file_path,
                "original_name": original_name,
            }
        )
        conn.commit()

        return {"message": f"Part created successfully"}

    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error.message)
        raise HTTPException(status_code=500, detail=error.message)

    finally:
        cur.close()
        conn.close()


@app.get("/parts/{part_id}")
def show_page_details(part_id: str):
    query = """
        SELECT
    RAWTOHEX(pr.ID)              AS id,
    RAWTOHEX(pr.PART_ID)         AS part_id,
    pr.REVISION,
    pr.NAME,
    pr.DESCRIPTION,
    RAWTOHEX(pr.CREATED_BY)      AS created_by,
    u.EMAIL                      AS created_by_email,
    u.USERNAME                   AS created_by_username,
    pr.CREATED_AT,
    pr.FILE_PATH,
    pr.ORIGINAL_FILENAME
FROM PART_REVISIONS pr
JOIN USER_TABLE u
    ON pr.CREATED_BY = u.ID
WHERE pr.ID = HEXTORAW(:part_id)
ORDER BY pr.CREATED_AT DESC
FETCH FIRST 1 ROW ONLY

    """

    try:
        conn = oracledb.connect(
            user="bidb",
            password="elcaro",
            dsn="127.0.0.1:1521/pdb1"
        )
        cur = conn.cursor()

        cur.execute(query, {"part_id": part_id})
        row = cur.fetchone()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail=f"No revision found for id={part_id}"
            )
        part = {
            "id": row[0],
            "part_id": row[1],
            "revision": row[2],
            "name": row[3],
            "description": row[4],
            "created_by": row[5],  # RAWTOHEX(CREATED_BY)
            "created_by_email": row[6],  # u.EMAIL
            "created_by_username": row[7],  # u.USERNAME
            "created_at": row[8],
            "file_path": row[9],
            "original_filename": row[10],
        }

        return part

    finally:
        cur.close()
        conn.close()

@app.get("/parts/{part_id}/file")
def view_part_file(part_id: str):
    query = """
        SELECT FILE_PATH, ORIGINAL_FILENAME
        FROM PART_REVISIONS
        WHERE ID = HEXTORAW(:part_id)
        ORDER BY CREATED_AT DESC
        FETCH FIRST 1 ROW ONLY
    """

    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )
    cur = conn.cursor()
    cur.execute(query, {"part_id": part_id})
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    file_path, original_filename = row

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing on disk")

    return FileResponse(
        path=file_path,
        filename=original_filename,
        media_type="application/pdf"  # works in browser viewer
    )


@app.get('/create-bom')
def get_all_parts():

    print("in create bom backend")
    return get_all_parts_info()

@app.post('/create-bom')
def create_bom(payload:BomCreate):
    return create_bom_details(payload)

@app.get('/dashboard')
def show_dashboard():
    return get_all_parts_with_revisions()

@app.get('/bom-details/{bomId}')
def get_bom_by_id(bomId: str):
    return get_bom_details_by_id(bomId)









