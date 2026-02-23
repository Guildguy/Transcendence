from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from noSQL import mongo, connect, close

@asynccontextmanager
async def lifespan(app: FastAPI):
    await   connect()
    yield
    await   close()

app = FastAPI(
    title="Profile Service",
    description="Microserviço Python para gerenciar perfis no MongoDB",
    lifespan=lifespan
)

@app.get("/")
async def root():
    return {"service": "profile-api", "status": "running"}

@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    try:
        profile = await mongo.db.profiles.find_one(
            {"user_id": user_id},
            {"stacks": 1, "_id": 0})
        
        if not profile:
            raise HTTPException(status_code=404, detail="Perfil não encontrado")
        return profile
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar perfil: {str(e)}")

@app.get("/health")
async def health_check():
    try:
        await mongo.db.command("ping")
        return {"status": "healthy", "mongodb": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"MongoDB indisponível: {str(e)}")
