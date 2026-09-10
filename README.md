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
