# Backend FastAPI

Un backend FastAPI a été ajouté au projet dans le dossier `backend/`.

## Installation

```bash
cd backend
python -m venv venv
```

Activer le venv :
- **Windows (Git Bash)** : `source venv/Scripts/activate`
- **Windows (CMD/PowerShell)** : `venv\Scripts\activate`
- **Linux/macOS** : `source venv/bin/activate`

Installer les dépendances :
```bash
pip install -r requirements.txt
```

## Lancer le serveur

```bash
uvicorn main:app --reload
```

(Si `uvicorn` non reconnu : `python -m uvicorn main:app --reload`)

- API : http://127.0.0.1:8000
- Doc interactive : http://127.0.0.1:8000/docs

> Penser à réactiver le venv à chaque nouvelle session de travail.

## Note

Pour que l'installation fonctionne chez les autres contributeurs, le fichier `requirements.txt` doit être commité dans le repo. Si ce n'est pas encore fait :

```bash
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Ajout des dépendances FastAPI"
```

Sans ça, `pip install -r requirements.txt` n'installera rien.

## SQLAlchemy + SQLite

Le projet utilise SQLAlchemy comme ORM avec une base SQLite.

### Installation

Se placer dans `backend/` avec le venv actif :

```bash
cd backend
source venv/Scripts/activate   # ou venv/bin/activate sous Linux/Mac
pip install sqlalchemy
pip freeze > requirements.txt
```

### Structure

```
backend/
├── main.py
├── database.py      ← connexion + session SQLAlchemy
├── models.py         ← définition des tables
├── schemas.py         ← modèles Pydantic (validation API)
```

### Fichiers clés

**`database.py`**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
```

**`models.py`**
```python
from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
```

**`main.py`** (extrait)
```python
from database import engine, SessionLocal, Base
import models

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Note sur les migrations

`Base.metadata.create_all()` crée les tables au démarrage mais ne gère pas les évolutions de schéma (ajout de colonnes, etc.). Pour ça, prévoir **Alembic** si le schéma doit évoluer souvent.
