from datetime import datetime,timedelta
from jose import jwt,JWTError

from passlib.context import CryptContext
from typing_extensions import deprecated

ACCESS_TOKEN_EXPIRATION_MINS=60

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

def hash_password(password:str)->str:
    return pwd_context.hash(password)

def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context.verify(plain_password,hashed_password)
