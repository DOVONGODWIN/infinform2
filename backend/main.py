import json
import os
import sqlite3
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent           # .../infinform2/backend
FRONTEND_DIR = BASE_DIR.parent / "frontend"          # .../infinform2/frontend
DB_PATH = os.environ.get("INFINI_DB_PATH", str(BASE_DIR / "infini_db.db"))

if not Path(DB_PATH).is_file():
    raise RuntimeError(
        f"Base SQLite introuvable : {DB_PATH}\n"
        "Crée-la depuis backend/schema.sql avant de lancer le serveur."
    )

app = FastAPI(title="CrazyDev API")

# Sans effet quand le front est servi par la même origine (dev via uvicorn, prod via nginx).
# Utile seulement si tu ouvres le front depuis un autre port (Live Server, etc.).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection():
    return sqlite3.connect(DB_PATH)


# ─────────────────────────────── API ───────────────────────────────
# À déclarer AVANT le montage statique (sinon il capte toutes les routes).

@app.get("/api/annonces")
def get_annonces():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT data FROM annonces ORDER BY id").fetchall()
    finally:
        conn.close()
    return [json.loads(row[0]) for row in rows]


@app.get("/api/annonces/{annonce_id}")
def get_annonce(annonce_id: int):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT data FROM annonces WHERE json_extract(data, '$.id') = ?",
            (annonce_id,),
        ).fetchone()
    finally:
        conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    return json.loads(row[0])


@app.get("/api/form")
def get_form():
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT data FROM formulaires ORDER BY id DESC LIMIT 1"
        ).fetchone()
    finally:
        conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Formulaire non trouvé")
    return json.loads(row[0])


# ──────────────────────── Frontend statique ────────────────────────
# En prod, nginx sert le dossier frontend/ directement → ce bloc n'est jamais atteint.
# En dev, il met le front et l'API sur la même origine (port 8000).

@app.get("/", include_in_schema=False)
def landing():
    return FileResponse(FRONTEND_DIR / "accueil.html")


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")