import uuid
from datetime import datetime
from pathlib import Path

import oracledb
from fastapi import HTTPException
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os,shutil
import binascii

from core.parts_funcs import get_parts_info_by_id
from models.bom_models import BomCreate


def get_all_parts_info():
    query="""
    SELECT
            id,
            name,
            part_number,
            created_by,
            created_at
        FROM parts p
    """
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )
    cur= conn.cursor()
    try:
        cur.execute(query)
        rows=cur.fetchall()
        parts=[]

        for row in rows:
            part={
                "id":row[0].hex() if row[0] else None,
                "name":row[1],
                "part_number":row[2],
                "created_by": row[3].hex() if row[3] else None,   # RAW → hex
                "created_at": row[4].isoformat() if row[4] else None
            }
            parts.append(part)

        return parts
    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cur.close()
        conn.close()

def create_bom_details(payload:BomCreate):
    query="""
    MERGE INTO PARTS_BOM b
USING (
    SELECT
        HEXTORAW(:parent_id) AS parent_id,
        HEXTORAW(:child_id)  AS child_id,
        :qty                AS quantity,
        :unit               AS units
    FROM dual
) src
ON (
    b.parent_id = src.parent_id
    AND b.child_id = src.child_id
)
WHEN MATCHED THEN
    UPDATE SET
        b.quantity = src.quantity,
        b.units    = src.units
WHEN NOT MATCHED THEN
    INSERT (
        parent_id,
        child_id,
        quantity,
        units
    )
    VALUES (
        src.parent_id,
        src.child_id,
        src.quantity,
        src.units
    )


    """
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )

    child_rows = payload.rows
    bom_rows = []

    cur = conn.cursor()
    try:
        for row in child_rows:
            cur.execute(query,{
                "parent_id":payload.parentPart.id,
                "child_id":row.child.id,
                "qty":row.quantity,
                "unit":row.unit,

            })
        print("created bom Done")
        conn.commit()
        return


    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cur.close()
        conn.close()

def get_bom_details_by_id(bomId:str):
    conn = oracledb.connect(
        user="bidb",
        password="elcaro",
        dsn="127.0.0.1:1521/pdb1"
    )
    only_parent_query="""
        SELECT
        RAWTOHEX(ID) AS id,
        NAME,
        PART_NUMBER
        FROM PARTS
        WHERE ID=:bom_id
    """
    parts_bom_query = """
        SELECT
        RAWTOHEX(PARENT_ID) AS parent_id,
        RAWTOHEX(CHILD_ID)  AS child_id,
        QUANTITY,
        UNITS
        FROM PARTS_BOM

    """
    parts_query="""
        SELECT
        RAWTOHEX(ID) AS id,
        NAME,
        PART_NUMBER
        FROM PARTS

    """
    result={}
    cur = conn.cursor()
    try:

        # creating parent data

        raw_bom_id = binascii.unhexlify(bomId)
        cur.execute(only_parent_query,{
            "bom_id":raw_bom_id
        })
        row=cur.fetchone()
        parent_data={
            "parent_id":row[0],
            "parent_name":row[1],
            "parent_part_number":row[2]
        }


        # creating bom

        bom_edges=[]
        cur.execute(parts_bom_query)

        bom_data =cur.fetchall()
        for row in bom_data:
            edge={
                "parent_id":row[0],
                "child_id":row[1],
                "quantity":row[2],
                "units":row[3]
            }
            bom_edges.append(edge)

        # part id data list

        parts_list=[]
        cur.execute(parts_query)
        rows=cur.fetchall()
        for row in rows:
            part={
                row[0]: {
                    "name":row[1],
                    "part_number":row[2]
                }
            }
            parts_list.append(part)





        return {
            "parent_data":parent_data,
            "bom_edges":bom_edges,
            "parts_list":parts_list
        }



    except oracledb.DatabaseError as err:
        conn.rollback()
        error, = err.args
        print(error)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        cur.close()
        conn.close()

