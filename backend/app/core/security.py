from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
import bcrypt
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# JWT Configuration
# In production, this should be explicitly read from environment variables.
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "b3901f4c7183eab5dc422d326f564be6f8510839eefcf3b7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day expiration

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare a plain text password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        # Fallback if the database still contains plaintext passwords during migration
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash for a plain text password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JSON Web Token (JWT) encapsulating the user identity."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def get_current_ops_user(user: dict = Depends(get_current_user)):
    if user.get("role") != "ops":
        raise HTTPException(status_code=403, detail="Insufficient privileges. Staff only.")
    return user
