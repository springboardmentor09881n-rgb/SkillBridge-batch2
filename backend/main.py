from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.user import router as user_router
from routes.profile import router as profile_router

app = FastAPI(title="SkillBridge Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(user_router, prefix="/api/user", tags=["User"])
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Backend Running"}
