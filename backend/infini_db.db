-- Script de création des tables SQLite (approche NoSQL via colonnes JSON)
-- Structure alignée sur annonces.json et form.json
-- Nécessite SQLite 3.38+ (JSON1 intégré par défaut)

PRAGMA foreign_keys = ON;

-- ============================================
-- Table des annonces
-- Chaque ligne = un objet annonce (titre, description, image, prix, time...)
-- ============================================
CREATE TABLE IF NOT EXISTS annonces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data JSON NOT NULL,
    date_creation TEXT NOT NULL DEFAULT (datetime('now')),
    date_modification TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- Table des formulaires
-- Chaque ligne = une DEFINITION de formulaire (title, subtitle, properties, steps)
-- ============================================
CREATE TABLE IF NOT EXISTS formulaires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data JSON NOT NULL,
    date_creation TEXT NOT NULL DEFAULT (datetime('now')),
    date_modification TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_annonces_titre ON annonces(json_extract(data, '$.titre'));
CREATE INDEX IF NOT EXISTS idx_formulaires_title ON formulaires(json_extract(data, '$.title'));

-- ============================================
-- Insertion des données actuelles (annonces.json)
-- ============================================
INSERT INTO annonces (data) VALUES ('{
    "id": 1,
    "titre": "Lamborghini GT271",
    "description": "Craquez pour cette Lamborghini GT271, une Grand Tourisme au design agressif et aux lignes tranchantes qui reprennent tout l''esprit sportif de la marque au taureau. Sa silhouette basse et ses finitions soignées lui donnent une allure aussi élégante qu''imposante sur la route. Sous le capot, un châssis rigide et une tenue de route incisive promettent des sensations fortes à chaque trajet. Un intérieur sport confortable complète cette expérience haut de gamme. Une occasion rare de s''offrir une italienne au caractère bien trempé, à un tarif totalement hors norme.",
    "image": "assets/images/lambo-gt271.jpg",
    "prix": "6767€",
    "time": 60
}');

INSERT INTO annonces (data) VALUES ('{
    "id": 2,
    "titre": "Villa en bord de mer",
    "description": "Craquez pour cette villa contemporaine, une résidence d''exception au design architectural saisissant et aux volumes généreux qui allient élégance méditerranéenne et modernité pure. Sa position dominante offre une vue imprenable, tandis que ses grandes baies vitrées et ses lignes épurées inondent l''intérieur de lumière naturelle. À l''extérieur, une piscine à débordement spectaculaire s''étend face au paysage, entourée de terrasses en pierre et d''un jardin luxuriant planté de palmiers. Un espace lounge extérieur complète cette expérience de vie haut de gamme, pensée pour recevoir et se détendre en toute intimité. Une occasion rare de s''offrir un cadre de vie d''exception, à la hauteur des plus belles propriétés de la Riviera.",
    "image": "assets/images/villa.jpg",
    "prix": "271€ les 30 nuits",
    "time": 90
}');

-- ============================================
-- Insertion de la définition de formulaire actuelle (form.json)
-- ============================================
INSERT INTO formulaires (data) VALUES ('{
    "title": "Formulaire Villa",
    "subtitle": "Projet de construction residentielle.",
    "properties": {
        "nom":          { "widget": "text",   "label": "Nom", "required": true },
        "prenom":       { "widget": "text",   "label": "Prenom", "required": true },
        "adresse":      { "widget": "text",   "label": "Adresse", "required": true },
        "email":        { "widget": "text",   "label": "Mail", "hint": "(non verifie, tape ce que tu veux)", "required": true },
        "age":          { "widget": "slider", "label": "Age", "min": 0, "max": 120, "required": true },
        "rideaux_ch3":  { "widget": "text",   "label": "Couleur des rideaux de la chambre 3", "placeholder": "ex. bleu nuit", "required": true },
        "portail":      { "widget": "radio",  "label": "Avec ou sans portail", "trueLabel": "Avec", "falseLabel": "Sans", "required": true },
        "foot_sdb":     { "widget": "checkbox", "label": "Terrain de foot dans la salle de bain", "required": true },
        "nb_chambres":  { "widget": "slider", "label": "Nombre de chambres", "min": 1, "max": 20, "required": true },
        "bruit_max":    { "widget": "slider", "label": "Volume de bruit max que les voisins doivent respecter", "hint": "(dB)", "min": 0, "max": 120, "unit": "dB", "required": true },
        "bruit_enr":    { "widget": "slider", "label": "Volume enregistre", "hint": "(dB, capteur de son)", "min": 0, "max": 120, "unit": "dB", "readonly": true },
        "case_vide":    { "widget": "text",   "label": "Ce champ doit rester vide", "defaultValue": "ne me supprimez pas", "mustBeEmpty": true, "required": true },
        "but_par_jour": { "widget": "slider", "label": "Combien de buts par jour dans la salle de bain ?", "min": 0, "max": 50, "required": true },
        "confirme":     { "widget": "checkbox", "label": "Cochez cette case pour NE PAS confirmer", "required": true },
        "email_bis":    { "widget": "text",   "label": "Retapez votre mail a l''envers, sans les voyelles", "required": true }
    },
    "steps": [
        { "fields": ["nom","prenom","adresse","email","age","rideaux_ch3","portail","foot_sdb","nb_chambres","bruit_max","bruit_enr","case_vide"],
          "submitLabel": "payer 0.271 EUR" },
        { "fields": ["but_par_jour","email_bis"],
          "submitLabel": "Valider (vraiment ?)" },
        { "fields": ["confirme"],
          "submitLabel": "Payer 0.271 EUR" }
    ]
}');

-- ============================================
-- Exemples de requêtes
-- ============================================

-- Toutes les annonces (titre + prix)
-- SELECT id, json_extract(data, '$.titre') AS titre, json_extract(data, '$.prix') AS prix FROM annonces;

-- Le titre du formulaire
-- SELECT json_extract(data, '$.title') FROM formulaires WHERE id = 1;

-- Les champs (properties) d'un formulaire
-- SELECT json_extract(data, '$.properties') FROM formulaires WHERE id = 1;