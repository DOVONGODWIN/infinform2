import sqlite3
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre en prod
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "infini_db.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


@app.get("/api/annonces")
def get_annonces():
    conn = get_connection()
    rows = conn.execute("SELECT data FROM annonces").fetchall()
    conn.close()
    # On reconstruit une liste d'objets JSON, comme annonces.json
    return [json.loads(row[0]) for row in rows]


@app.get("/api/annonces/{annonce_id}")
def get_annonce(annonce_id: int):
    conn = get_connection()
    row = conn.execute(
        "SELECT data FROM annonces WHERE json_extract(data, '$.id') = ?",
        (annonce_id,)
    ).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Annonce non trouvée")
    return json.loads(row[0])


@app.get("/api/form")
def get_form():
    conn = get_connection()
    row = conn.execute("SELECT data FROM formulaires ORDER BY id DESC LIMIT 1").fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Formulaire non trouvé")
    return json.loads(row[0])