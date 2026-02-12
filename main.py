from fastapi import FastAPI
from routes import user, profile

app = FastAPI()

app.include_router(user.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"message": "SkillBridge Backend Running"}
