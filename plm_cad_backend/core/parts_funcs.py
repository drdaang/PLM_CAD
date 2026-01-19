import uuid
from datetime import datetime
from pathlib import Path
import binascii
import oracledb
from fastapi import HTTPException
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os,shutil

UPLOAD_DIR="D:\\myprojs\\plm_cad\\public"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_part_info_by_part_number(part_number):
    get_parts_query="""
    SELECT * FROM PARTS WHERE PART_NUMBER=:part_number
    """
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )

    cur = conn.cursor()

    try:
        cur.execute(get_parts_query,{"part_number":part_number} )
        return cur.fetchone()

    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cur.close()
        conn.close()

def get_all_parts_with_revisions():
    query = """SELECT * FROM PART_REVISIONS"""
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )
    cur= conn.cursor()
    try:
        cur.execute(query)
        columns = [col[0].lower() for col in cur.description]
        result=[]

        for row in cur.fetchall():
            record = {}
            for col,val in zip(columns,row):
                if isinstance(val,(bytes,bytearray)):
                    record[col]=val.hex()
                elif isinstance(val, datetime):
                    record[col]=val.isoformat()
                else:
                    record[col]=val
            result.append(record)

        return result
    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cur.close()
        conn.close()
def upload_File_locally(PartFile,part_number):
    part_dir=os.path.join(UPLOAD_DIR,part_number)
    os.makedirs(part_dir,exist_ok=True)

    original_name = Path(PartFile.filename).name
    unique_id = uuid.uuid4().hex

    new_filename = f"{unique_id}_{original_name}"
    file_path=os.path.join(part_dir,new_filename)

    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(PartFile.file,buffer)
    PartFile.file.close()


    return {"original_name":original_name,
            "file_path":file_path}

def get_parts_info_by_id(partId:str):
    get_parts_query = """
        SELECT name,part_number FROM PARTS WHERE ID=:part_id
        """
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )

    cur = conn.cursor()

    try:
        raw_bom_id = binascii.unhexlify(partId)
        cur.execute(get_parts_query, {"part_id": raw_bom_id})
        row=cur.fetchone()
        return row


    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cur.close()
        conn.close()





