from contextlib import asynccontextmanager
import os
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from prometheus_fastapi_instrumentator import Instrumentator
from db.noSQL import mongo, connect, close


class ProfileUpsertRequest(BaseModel):
    profile_id: str = Field(min_length=1)
    stacks: list[str] = Field(default_factory=list)


class ProfileImageRequest(BaseModel):
    profile_id: str = Field(min_length=1)
    image_base64: str = Field(min_length=1)
    image_file_name: str = Field(min_length=1)


def normalize_stacks(stacks: list[str]) -> list[str]:
    unique: list[str] = []
    for stack in stacks:
        cleaned = stack.strip()
        if cleaned and cleaned not in unique:
            unique.append(cleaned)
    return unique

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

# Prometheus metrics endpoint /metrics
Instrumentator().instrument(app).expose(app)

cors_origins = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"service": "profile-api", "status": "running"}

@app.get("/profile/{profile_id}")
async def get_profile(profile_id: str):
    try:
        profile = await mongo.db.profiles.find_one(
            {"profile_id": profile_id},
            {"stacks": 1, "_id": 0})

        if not profile:
            raise HTTPException(status_code=404, detail="Perfil não encontrado")
        return profile

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar perfil: {str(e)}")


@app.post("/profile")
async def upsert_profile(payload: ProfileUpsertRequest):
    try:
        profile_doc: dict[str, Any] = {
            "profile_id": payload.profile_id,
            "stacks": normalize_stacks(payload.stacks),
        }

        await mongo.db.profiles.update_one(
            {"profile_id": payload.profile_id},
            {"$set": profile_doc},
            upsert=True,
        )

        saved_profile = await mongo.db.profiles.find_one(
            {"profile_id": payload.profile_id},
            {"_id": 0},
        )
        return {"message": "Perfil salvo com sucesso", "profile": saved_profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar perfil: {str(e)}")

@app.get("/health")
async def health_check():
    try:
        await mongo.db.command("ping")
        return {"status": "healthy", "mongodb": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"MongoDB indisponível: {str(e)}")


@app.post("/profile/image")
async def save_profile_image(payload: ProfileImageRequest):
    """
    Salva a imagem do perfil no MongoDB
    Request body:
    {
        "profile_id": "1",
        "image_base64": "data:image/png;base64,iVBORw0KGgo...",
        "image_file_name": "avatar.png"
    }
    """
    try:
        image_doc: dict[str, Any] = {
            "profile_id": payload.profile_id,
            "image_base64": payload.image_base64,
            "image_file_name": payload.image_file_name,
        }

        await mongo.db.profile_images.update_one(
            {"profile_id": payload.profile_id},
            {"$set": image_doc},
            upsert=True,
        )

        return {
            "message": "Imagem do perfil salva com sucesso",
            "profile_id": payload.profile_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar imagem: {str(e)}")


@app.get("/profile/image/{profile_id}")
async def get_profile_image(profile_id: str):
    """
    Recupera a imagem do perfil pelo profile_id
    """
    try:
        image_doc = await mongo.db.profile_images.find_one(
            {"profile_id": profile_id},
            {"_id": 0}
        )

        if not image_doc:
            raise HTTPException(status_code=404, detail="Imagem do perfil não encontrada")
        
        return image_doc

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imagem: {str(e)}")