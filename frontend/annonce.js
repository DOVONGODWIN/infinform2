let toutesLesAnnonces = []; 

document.addEventListener('DOMContentLoaded', chargerAnnonces);

async function chargerAnnonces() {
  const container = document.getElementById('annonces-container');

  try {
    const response = await fetch('annonces.json');

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    toutesLesAnnonces = await response.json(); 
    afficherAnnonces(toutesLesAnnonces, container); 

  } catch (error) {
    console.error('Erreur lors du chargement du JSON :', error);
    container.innerHTML = `<p>Impossible de charger les annonces. (${error.message})</p>`;
  }
}

function afficherAnnonces(annonces, container) {
  container.innerHTML = '';

  if (!annonces || annonces.length === 0) {
    container.innerHTML = '<p>Aucune annonce disponible pour le moment.</p>';
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

    if (!annonce) {
    container.innerHTML = `
      <p>Annonce introuvable.</p>
      <button id="btn-retour">Retour à la liste</button>
    `;
    document.getElementById('btn-retour').addEventListener('click', retourALaListe);
    return;
  }

  container.innerHTML = `
    <button id="btn-retour">Retour à la liste</button>
    <h2>${annonce.titre}</h2>
    <img src="${annonce.image}" alt="${annonce.titre}" width="500">
    <p>${annonce.description}</p>
    <p><strong>${annonce.prix}</strong></p>
        <button id="open-form-button">Réserver</button>

        
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
  carte.dataset.id = annonce.id;

  carte.innerHTML = `
    <button onclick="afficherDetailsAnnonce(${annonce.id})">
        <h2>${annonce.titre}</h2>
        <div>
            <img src="${annonce.image}" alt="${annonce.titre}" width="300">
        
<            <div>
>                <p>${annonce.description}</p>
                <p><strong>${annonce.prix}</strong></p>
            </div>
        </div>
        
        <hr>
    </button>
  `;

  return carte;
}