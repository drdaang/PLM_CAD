import oracledb
from fastapi import HTTPException

from jose import jwt, JWTError

from auth.create_token import SECRET_KEY, ALGORITHM


def create_users_table_if_not_exists(cur):
    cur.execute("""
    SELECT COUNT(*) FROM user_tables
    WHERE TABLE_NAME='USER_TABLE'
    """)
    exists= cur.fetchone()[0]
    if exists==0:
        cur.execute("""
                CREATE TABLE USER_TABLE(
                id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
                email VARCHAR2(255) UNIQUE NOT NULL,
                password VARCHAR2(255) NOT NULL,
                username VARCHAR2(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        """)
def get_current_user_email(token: str):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        email:str=payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401,detail="invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401,detail="invalid token")

def get_user_by_email(email:str):
    query="""SELECT * FROM USER_TABLE WHERE email=:email"""
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )

    cur = conn.cursor()

    try:
        cur.execute(query, {"email":email})
        user=cur.fetchone()
        return user
    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cur.close()
        conn.close()


