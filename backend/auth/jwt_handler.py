
import time
from typing import Dict
from jose import jwt
from decouple import config

JWT_SECRET = config("secret", default="your_secret_key")
JWT_ALGORITHM = config("algorithm", default="HS256")

def token_response(token: str):
    return {
        "access_token": token
    }

def signJWT(user_id: str, role: str) -> Dict[str, str]:
    payload = {
        "user_id": user_id,
        "role": role,
        "expires": time.time() + 3600 # 1 hour
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token_response(token)

def decodeJWT(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded_token if decoded_token["expires"] >= time.time() else None
    except:
        return {}
