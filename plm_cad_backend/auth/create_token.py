from datetime import datetime, timedelta, timezone
from jose import jwt,JWTError
from jose.constants import ALGORITHMS

SECRET_KEY="Super_secret_key"
ALGORITHM="HS256"

def create_access_token(data:dict,expire_delta:timedelta|None=None):
    to_encode= data.copy()
    expire = datetime.now(timezone.utc)+ (expire_delta or timedelta(minutes=15))
    to_encode.update({"exp":expire})
    encoded_jwt= jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt