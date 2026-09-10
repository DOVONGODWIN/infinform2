import sqlite3
import json

DB_PATH = "infini_db.db"
ANNONCES_JSON = "../frontend/json/annonces.json"
FORM_JSON = "../frontend/json/form.json"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# --- Annonces ---
with open(ANNONCES_JSON, encoding="utf-8") as f:
    annonces = json.load(f)

for annonce in annonces:
    cur.execute(
        "INSERT INTO annonces (data) VALUES (?)",
        (json.dumps(annonce, ensure_ascii=False),)
    )

print(f"{len(annonces)} annonce(s) insérée(s).")

# --- Formulaire ---
with open(FORM_JSON, encoding="utf-8") as f:
    form = json.load(f)

cur.execute(
    "INSERT INTO formulaires (data) VALUES (?)",
    (json.dumps(form, ensure_ascii=False),)
)

print("1 formulaire inséré.")

conn.commit()

# --- Vérification ---
tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tables présentes :", tables)

nb_annonces = cur.execute("SELECT COUNT(*) FROM annonces").fetchone()[0]
nb_formulaires = cur.execute("SELECT COUNT(*) FROM formulaires").fetchone()[0]
print(f"Total annonces en base : {nb_annonces}")
print(f"Total formulaires en base : {nb_formulaires}")

conn.close()
