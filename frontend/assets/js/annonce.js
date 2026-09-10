let toutesLesAnnonces = [];

document.addEventListener('DOMContentLoaded', chargerAnnonces);

async function chargerAnnonces() {
  const container = document.getElementById('annonces-container');

  try {
    const response = await fetch("/api/annonces");

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    toutesLesAnnonces = await response.json();
    afficherAnnonces(toutesLesAnnonces, container);

  } catch (error) {
    console.error('Erreur lors du chargement du JSON :', error);
    container.innerHTML = `<p class="message-erreur">Impossible de charger les annonces. (${error.message})</p>`;
  }
}

function afficherAnnonces(annonces, container) {
  container.className = 'annonces-grid';
  container.innerHTML = '';

  if (!annonces || annonces.length === 0) {
    container.innerHTML = '<p class="message-erreur">Aucune annonce disponible pour le moment.</p>';
    return;
  }

  annonces.forEach(annonce => {
    const carte = creerCarteAnnonce(annonce);
    container.appendChild(carte);
  });
}

function afficherDetailsAnnonce(id) {
  const nouvelleURL = `${window.location.pathname}?id=${id}`;
  history.pushState({ id: id }, '', nouvelleURL);

  const container = document.getElementById('annonces-container');
  const annonce = toutesLesAnnonces.find(a => a.id === id);

  container.className = 'annonce-detail';

  if (!annonce) {
    container.innerHTML = `
      <p class="message-erreur">Annonce introuvable.</p>
      <button id="btn-retour" class="retour">Retour à la liste</button>
    `;
    document.getElementById('btn-retour').addEventListener('click', retourALaListe);
    return;
  }

  container.innerHTML = `
    <button id="btn-retour" class="retour">← Retour à la liste</button>
    <img src="${annonce.image}" alt="${annonce.titre}">
    <h1>${annonce.titre}</h1>
    <p class="prix">${annonce.prix}</p>
    <p class="description">${annonce.description}</p>
    <button id="open-form-button" class="btn-reserver">Réserver</button>
  `;

  document.getElementById('btn-retour').addEventListener('click', retourALaListe);
  document.getElementById('open-form-button')
    .addEventListener('click', () => {
      localStorage.setItem('annonceTime', annonce.time);
      window.open("form_page.html", "_blank");
    });
}

function retourALaListe() {
  history.pushState({}, '', window.location.pathname);
  afficherAnnonces(toutesLesAnnonces, document.getElementById('annonces-container'));
}

function creerCarteAnnonce(annonce) {
  const carte = document.createElement('div');
  carte.className = 'annonce-card';
  carte.dataset.id = annonce.id;

  carte.innerHTML = `
    <button onclick="afficherDetailsAnnonce(${annonce.id})">
      <img src="${annonce.image}" alt="${annonce.titre}">
      <div class="annonce-card-body">
        <h2>${annonce.titre}</h2>
        <p>${annonce.description}</p>
        <p class="prix">${annonce.prix}</p>
      </div>
    </button>
  `;

  return carte;
}