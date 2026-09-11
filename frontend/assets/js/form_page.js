let CONFIG;
let currentStep = 0;
let root;
const state = {};       // valeurs des widgets speciaux : state[key] = nombre courant
const interacted = {};  // pour les widgets sans target (mode "remplace un slider") : a-t-on touché au moins une fois ?

async function init() {
  root = document.getElementById("form-root");

  const type = localStorage.getItem('annonceType') || 'voiture';
  const res = await fetch(`/api/form?type=${type}`);
  CONFIG = await res.json();

  const h1 = document.createElement("h1"); h1.textContent = CONFIG.title;
  const sub = document.createElement("p"); sub.className = "subtitle"; sub.textContent = CONFIG.subtitle;
  root.append(h1, sub);

  renderStep(0);
}

function createField(key) {
  const prop = CONFIG.properties[key];
  const field = document.createElement("div");
  field.className = "field";

  const label = document.createElement("label");
  label.className = "label";
  label.innerHTML = prop.label + (prop.hint ? ' <span class="hint">' + prop.hint + '</span>' : "");
  field.appendChild(label);

  let input;

  if (prop.widget === "cannon") {
    field.appendChild(buildCannon(key, prop));

  } else if (prop.widget === "balance") {
    field.appendChild(buildBalance(key, prop));

  } else if (prop.widget === "slider") {
    const row = document.createElement("div");
    row.className = "slider-row";
    input = document.createElement("input");
    input.type = "range";
    input.min = prop.min; input.max = prop.max;
    input.value = prop.readonly ? prop.min : Math.round((prop.min + prop.max) / 4);
    if (prop.readonly) input.disabled = true;
    const val = document.createElement("span");
    val.className = "slider-val";
    const show = () => val.textContent = input.value + (prop.unit ? " " + prop.unit : "");
    input.addEventListener("input", () => { show(); checkTraps(); });
    show();
    row.append(input, val);
    field.appendChild(row);

  } else if (prop.widget === "radio") {
    const group = document.createElement("div");
    group.className = "radio-group";
    [[prop.trueLabel, "true"], [prop.falseLabel, "false"]].forEach(([txt, v]) => {
      const l = document.createElement("label");
      const r = document.createElement("input");
      r.type = "radio"; r.name = key; r.value = v;
      l.append(r, document.createTextNode(" " + txt));
      group.appendChild(l);
    });
    input = group;
    field.appendChild(group);

  } else if (prop.widget === "checkbox") {
    const wrap = document.createElement("div");
    wrap.className = "checkbox-row";
    input = document.createElement("input");
    input.type = "checkbox";
    input.name = key;
    wrap.append(input, document.createTextNode(" " + prop.label));
    label.remove();
    field.appendChild(wrap);

  } else { // text
    input = document.createElement("input");
    input.type = "text";
    if (prop.placeholder) input.placeholder = prop.placeholder;
    if (prop.defaultValue) input.value = prop.defaultValue;
    if (prop.maxLength) input.maxLength = prop.maxLength;   // SADIQUE : 2 caracteres max
    field.appendChild(input);
  }

  if (input && !input.name) input.name = key;
  return field;
}

/* ============================================
   WIDGET CANON — maintien pour charger, relachement pour tirer
   Plus on reste appuye longtemps, plus le boulet part loin.
   Ou il atterit = valeur selectionnee (mappee sur [min, max]).

   - Si prop.target est defini : mode "puzzle", il faut atterir EXACTEMENT
     sur la cible (avec un risque de rate aleatoire, mode sadique).
   - Si prop.target est absent : mode "libre", remplace un slider classique,
     la valeur choisie est simplement celle du point d'atterrissage.
   ============================================ */
function buildCannon(key, prop) {
  const isPuzzle = prop.target !== undefined && prop.target !== null;
  state[key] = isPuzzle ? 0 : Math.round((prop.min + prop.max) / 2);
  interacted[key] = false;

  const MAX_CHARGE_MS = 1400;
  const MAX_DISTANCE_PX = 130;

  const wrap = document.createElement("div");
  wrap.className = "cannon-wrap";

  const scene = document.createElement("div");
  scene.className = "cannon-scene";
  scene.innerHTML =
    '<span class="cannon-emoji">|=====@</span>' +
    '<span class="cannon-ball">o</span>' +
    (isPuzzle ? '<span class="cannon-target">[' + prop.target + ']</span>' : '');

  const chargeBar = document.createElement("div");
  chargeBar.className = "charge-bar";
  const chargeFill = document.createElement("div");
  chargeFill.className = "charge-fill";
  chargeBar.appendChild(chargeFill);

  const readout = document.createElement("div");
  readout.className = "cannon-readout";
  const refresh = () => {
    readout.textContent = isPuzzle
      ? "Valeur : " + state[key] + " / cible " + prop.target
      : "Valeur : " + state[key] + (prop.unit ? " " + prop.unit : "");
  };
  refresh();

  const holdBtn = document.createElement("button");
  holdBtn.type = "button";
  holdBtn.textContent = "MAINTENIR POUR CHARGER";
  holdBtn.className = "cannon-btn";

  const ball = scene.querySelector(".cannon-ball");

  let chargeStart = null;
  let chargeRAF = null;
  let firing = false;

  function tickCharge() {
    if (chargeStart === null) return;
    const elapsed = Math.min(Date.now() - chargeStart, MAX_CHARGE_MS);
    const power = elapsed / MAX_CHARGE_MS;
    chargeFill.style.width = (power * 100) + "%";
    ball.style.transform = "translateX(" + (power * MAX_DISTANCE_PX * 0.5) + "px)";
    if (chargeStart !== null) chargeRAF = requestAnimationFrame(tickCharge);
  }

  function startCharge(e) {
    if (firing) return;
    e.preventDefault();
    chargeStart = Date.now();
    holdBtn.classList.add("charging");
    tickCharge();
  }

  function releaseCharge() {
    if (chargeStart === null || firing) return;
    firing = true;
    const elapsed = Math.min(Date.now() - chargeStart, MAX_CHARGE_MS);
    const power = elapsed / MAX_CHARGE_MS;
    chargeStart = null;
    if (chargeRAF) cancelAnimationFrame(chargeRAF);
    holdBtn.classList.remove("charging");
    chargeFill.style.width = "0%";

    ball.style.transition = "transform .6s cubic-bezier(.2,.7,.3,1)";
    ball.style.transform = "translateX(" + (power * MAX_DISTANCE_PX) + "px)";

    setTimeout(() => {
      let landedValue = Math.round(prop.min + power * (prop.max - prop.min));

      if (isPuzzle) {
        // 20% de rate en mode puzzle : le boulet retombe et enleve 2
        if (Math.random() < 0.2) {
          state[key] = Math.max(prop.min, state[key] - 2);
          readout.textContent = "RATE ! Le boulet retombe. -2  (" + state[key] + ")";
        } else {
          state[key] = Math.min(prop.max, landedValue);
          refresh();
        }
      } else {
        state[key] = Math.min(prop.max, Math.max(prop.min, landedValue));
        interacted[key] = true;
        refresh();
      }

      ball.style.transition = "none";
      ball.style.transform = "translateX(0)";
      firing = false;
    }, 650);
  }

  holdBtn.addEventListener("mousedown", startCharge);
  holdBtn.addEventListener("touchstart", startCharge, { passive: false });
  window.addEventListener("mouseup", releaseCharge);
  window.addEventListener("touchend", releaseCharge);

  wrap.append(scene, chargeBar, readout, holdBtn);
  return wrap;
}

/* ============================================
   WIDGET BALANCE — on maintient et on bouge la souris pour incliner
   Une bille roule sur la barre en fonction de l'inclinaison.
   Sa position au relachement = valeur selectionnee (mappee sur [min, max]).

   - Si prop.target est defini : mode "puzzle", il faut relacher avec la
     bille EXACTEMENT sur la valeur cible (mode sadique : parfois la bille
     glisse toute seule d'une case).
   - Si prop.target est absent : mode "libre", remplace un slider classique.
   ============================================ */
function buildBalance(key, prop) {
  const isPuzzle = prop.target !== undefined && prop.target !== null;
  state[key] = isPuzzle ? Math.round((prop.min + prop.max) / 2) : Math.round((prop.min + prop.max) / 2);
  interacted[key] = false;

  const MAX_ANGLE = 28; // degres

  const wrap = document.createElement("div");
  wrap.className = "balance-wrap";

  const track = document.createElement("div");
  track.className = "balance-track";

  const beam = document.createElement("div");
  beam.className = "balance-beam";

  const ball = document.createElement("div");
  ball.className = "balance-ball";
  beam.appendChild(ball);

  track.appendChild(beam);

  if (isPuzzle) {
    const markerPos = (prop.target - prop.min) / (prop.max - prop.min) * 100;
    const marker = document.createElement("div");
    marker.className = "balance-target-marker";
    marker.style.left = markerPos + "%";
    marker.textContent = prop.target;
    track.appendChild(marker);
  }

  const scale = document.createElement("div");
  scale.className = "balance-scale";
  scale.innerHTML = "<span>" + prop.min + "</span><span>" + prop.max + "</span>";

  const readout = document.createElement("div");
  readout.className = "balance-readout";

  const valueFromAngle = (angle) => {
    const t = (angle + MAX_ANGLE) / (MAX_ANGLE * 2); // 0..1
    return Math.round(prop.min + t * (prop.max - prop.min));
  };
  const angleFromValue = (value) => {
    const t = (value - prop.min) / (prop.max - prop.min);
    return t * (MAX_ANGLE * 2) - MAX_ANGLE;
  };

  let currentAngle = angleFromValue(state[key]);

  const applyAngle = (angle) => {
    currentAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle));
    beam.style.transform = "rotate(" + currentAngle + "deg)";
    const ballPos = (currentAngle + MAX_ANGLE) / (MAX_ANGLE * 2) * 100;
    ball.style.left = ballPos + "%";
  };
  applyAngle(currentAngle);

  const refresh = (value, missText) => {
    if (missText) {
      readout.textContent = missText;
      return;
    }
    readout.textContent = isPuzzle
      ? "Valeur : " + value + " / cible " + prop.target
      : "Valeur : " + value + (prop.unit ? " " + prop.unit : "");
  };
  refresh(state[key]);

  let dragging = false;
  let startX = 0;
  let startAngle = 0;

  function startDrag(e) {
    dragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    startAngle = currentAngle;
    track.classList.add("dragging");
    e.preventDefault();
  }

  function moveDrag(e) {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const dx = x - startX;
    const angle = startAngle + dx * 0.3; // sensibilite
    applyAngle(angle);
    refresh(valueFromAngle(currentAngle));
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("dragging");

    let finalValue = valueFromAngle(currentAngle);

    if (isPuzzle) {
      // mode sadique : parfois la bille glisse toute seule d'une case au relachement
      if (Math.random() < 0.15) {
        const nudge = Math.random() < 0.5 ? -1 : 1;
        finalValue = Math.max(prop.min, Math.min(prop.max, finalValue + nudge));
        applyAngle(angleFromValue(finalValue));
        state[key] = finalValue;
        refresh(null, "La bille a glisse...");
        return;
      }
      state[key] = finalValue;
      refresh(finalValue);
    } else {
      state[key] = finalValue;
      interacted[key] = true;
      refresh(finalValue);
    }
  }

  beam.addEventListener("mousedown", startDrag);
  beam.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("mousemove", moveDrag);
  window.addEventListener("touchmove", moveDrag, { passive: false });
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  wrap.append(track, scale, readout);
  return wrap;
}

/* le piege sonore : message qui reagit aux sliders */
function checkTraps() {
  const box = document.getElementById("trap-msg");
  if (!box) return;
  const max = document.querySelector('[name="bruit_max"]');
  const enr = document.querySelector('[name="bruit_enr"]');
  if (max && enr) {
    const infraction = Number(enr.value) > Number(max.value);
    box.textContent = infraction
      ? "/!\\ Volume legal max : " + max.value + " dB - INFRACTION detectee (" + enr.value + " dB)."
      : "Volume legal max : " + max.value + " dB - aucune infraction detectee.";
  }
}

/* validation d'une etape : renvoie la liste des erreurs */
function validateStep(step) {
  const errors = [];
  step.fields.forEach(key => {
    const prop = CONFIG.properties[key];
    if (!prop.required) return;

    if (prop.widget === "cannon" || prop.widget === "balance") {
  const isPuzzle = prop.target !== undefined && prop.target !== null;
  if (isPuzzle) {
    const tolerance = prop.tolerance !== undefined ? prop.tolerance : 5;   // ±5 par defaut
    if (Math.abs(state[key] - prop.target) > tolerance)
      errors.push("'" + prop.label + "' : approchez-vous de " + prop.target +
                  " (a " + tolerance + " pres). Actuel : " + state[key] + ".");
  } else if (!interacted[key]) {
    errors.push("'" + prop.label + "' : veuillez selectionner une valeur.");
  }
} else if (prop.widget === "radio") {
      if (!document.querySelector('[name="' + key + '"]:checked'))
        errors.push("Le champ '" + prop.label + "' est obligatoire.");

    } else if (prop.widget === "checkbox") {
      if (!document.querySelector('[name="' + key + '"]').checked)
        errors.push("Le champ '" + prop.label + "' est obligatoire.");

    } else { // text / slider
      const value = document.querySelector('[name="' + key + '"]').value.trim();
      if (prop.mustBeEmpty) {
        if (value !== "") errors.push("Le champ '" + prop.label + "' doit etre vide.");
      } else if (value === "") {
        errors.push("Le champ '" + prop.label + "' est obligatoire.");
      }
    }
  });
  return errors;
}

function renderStep(i) {
  const step = CONFIG.steps[i];
  const section = document.createElement("div");
  section.className = "step";

  step.fields.forEach(key => section.appendChild(createField(key)));

  if (i === 0) {
    const trap = document.createElement("div");
    trap.className = "trap-msg";
    trap.id = "trap-msg";
    section.appendChild(trap);
  }

  const btn = document.createElement("button");
  btn.textContent = step.submitLabel;
  btn.addEventListener("click", () => {
    const errors = validateStep(step);
    if (errors.length) {
      // SADIQUE : message vague OU detaille, au hasard
      if (Math.random() < 0.5) alert("Erreur.");
      else alert("Erreur.\n\n" + errors.join("\n"));
      return;
    }
    btn.disabled = true;
    currentStep++;
    if (currentStep < CONFIG.steps.length) {
      renderStep(currentStep);
    } else {
      const done = document.createElement("div");
      done.className = "trap-msg";
      done.textContent = "Formulaire soumis. (ou peut-etre pas.)";
      root.appendChild(done);
    }
  });
  section.appendChild(btn);

  root.appendChild(section);
  if (i === 0) checkTraps();
}

init();