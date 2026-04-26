from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load env variables (API_NINJAS_KEY, dll) dari root folder
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Import aplikasi FastAPI dari api
from api.SistemPakar import app as pakar_app
from api.Fuzzy import app as fuzzy_app

app = FastAPI(title="Asistensi Unified API untuk Vercel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount aplikasi lama ke sub-path /api/pakar dan /api/fuzzy
app.mount("/api/pakar", pakar_app)
app.mount("/api/fuzzy", fuzzy_app)

@app.get("/api")
def root():
    return {"message": "Unified API is running on Vercel"}
