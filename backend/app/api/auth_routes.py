from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
import sqlite3

router = APIRouter()

class StaffSignup(BaseModel):
    staff_id: str
    password: str
    name: str

class StaffLogin(BaseModel):
    staff_id: str
    password: str

class FanSignup(BaseModel):
    ticket_id: str
    password: str
    name: str

class FanLogin(BaseModel):
    ticket_id: str
    password: str

@router.post("/staff/signup")
async def staff_signup(data: StaffSignup):
    db = await get_db()
    try:
        hashed_pw = get_password_hash(data.password)
        await db.execute(
            "INSERT INTO staff (staff_id, password, name) VALUES (?, ?, ?)", 
            (data.staff_id, hashed_pw, data.name)
        )
        await db.commit()
        
        # Issue JWT
        token = create_access_token({"sub": data.staff_id, "role": "ops", "name": data.name})
        return {"success": True, "token": token, "staff_id": data.staff_id, "name": data.name, "role": "ops"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Staff ID already exists or database error")
    finally:
        await db.close()

@router.post("/staff/login")
async def staff_login(data: StaffLogin):
    db = await get_db()
    try:
        async with db.execute("SELECT staff_id, name, role, password FROM staff WHERE staff_id = ?", (data.staff_id,)) as cursor:
            row = await cursor.fetchone()
            
            if row and verify_password(data.password, row["password"]):
                token = create_access_token({"sub": row["staff_id"], "role": row["role"], "name": row["name"]})
                return {"success": True, "token": token, "staff_id": row["staff_id"], "name": row["name"], "role": row["role"]}
                
            raise HTTPException(status_code=401, detail="Invalid Staff ID or Password")
    finally:
        await db.close()

@router.post("/fan/signup")
async def fan_signup(data: FanSignup):
    db = await get_db()
    try:
        hashed_pw = get_password_hash(data.password)
        await db.execute(
            "INSERT INTO fans (ticket_id, password, name) VALUES (?, ?, ?)", 
            (data.ticket_id, hashed_pw, data.name)
        )
        await db.commit()
        
        token = create_access_token({"sub": data.ticket_id, "role": "fan", "name": data.name})
        return {"success": True, "token": token, "ticket_id": data.ticket_id, "name": data.name, "role": "fan"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Ticket ID already exists or database error")
    finally:
        await db.close()

@router.post("/fan/login")
async def fan_login(data: FanLogin):
    db = await get_db()
    try:
        async with db.execute("SELECT ticket_id, name, password FROM fans WHERE ticket_id = ?", (data.ticket_id,)) as cursor:
            row = await cursor.fetchone()
            
            if row and verify_password(data.password, row["password"]):
                token = create_access_token({"sub": row["ticket_id"], "role": "fan", "name": row["name"]})
                return {"success": True, "token": token, "ticket_id": row["ticket_id"], "name": row["name"], "role": "fan"}
                
            raise HTTPException(status_code=401, detail="Invalid Ticket ID or Password")
    finally:
        await db.close()
