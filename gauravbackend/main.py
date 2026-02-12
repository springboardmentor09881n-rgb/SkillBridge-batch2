from fastapi import FastAPI
from routes.user import router as user_router
from routes.profile import router as profile_router

app = FastAPI(title="SkillBridge Backend")

# Include routers
app.include_router(user_router, prefix="/api/user", tags=["User"])
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Backend Running"}
