
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from auth.jwt_handler import decodeJWT

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/user/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decodeJWT(token)
    if not payload:
        raise credentials_exception

    return payload
