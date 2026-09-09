 const fields = {
    "nom":   { "type": "string" },
    "age":   { "type": "integer" },
    "email": { "type": "string", "format": "email" }
  };

  const container = document.getElementById("form-container");

  for (const [key, prop] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type =
      prop.format === "email" ? "email" :
      prop.type === "integer" ? "number" : "text";
    input.id = input.name = key;

    const label = document.createElement("label");
    label.textContent = key;
    label.htmlFor = key;

    container.append(label, input);
  }


  export function openFormPage() {
    window.open("form_page.html", "_blank");
  }