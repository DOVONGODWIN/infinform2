 const fields = {
    "nom":   { "type": "string" },
    "age":   { "type": "integer" },
    "email": { "type": "string", "format": "email" }
  };

  /* Le moteur : lit form_config.json et genere le formulaire */

let CONFIG;
let currentStep = 0;
let root;

async function init() {
  root = document.getElementById("form-root");

  const res = await fetch("/api/form");
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

  if (prop.widget === "slider") {
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
    field.appendChild(input);
  }

  if (input && !input.name) input.name = key;
  return field;
}

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

function validateStep(step) {
  const errors = [];
  step.fields.forEach(key => {
    const prop = CONFIG.properties[key];
    if (!prop.required) return;

    if (prop.widget === "radio") {
      if (!document.querySelector('[name="' + key + '"]:checked'))
        errors.push("Le champ '" + prop.label + "' est obligatoire.");
    } else if (prop.widget === "checkbox") {
      if (!document.querySelector('[name="' + key + '"]').checked)
        errors.push("Le champ '" + prop.label + "' est obligatoire.");
    } else {
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
      alert("Erreur.\n\n" + errors.join("\n"));
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

  export function openFormPage() {
    window.open("form_page.html", "_blank");
  }