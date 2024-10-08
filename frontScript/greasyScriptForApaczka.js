// ==UserScript==
// @name         greasyScriptForApaczka
// @namespace    https://greasyfork.org/
// @version      2024-09-09
// @description  Skrypt wstrzykniety na stronę po stronie uzytkownia za pomocą skryptów greasyfork.org. Wysyłka danych do Apczaki, tworzenie listu przewozwego
// @author       Rafał
// @match        https://skladmuzyczny.pl/backend.php/order/edit/id/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skladmuzyczny.pl
// @grant        window.onurlchange
// ==/UserScript==

(function () {
  "use strict";
  const sf_fieldset_dane_dostawy = document.querySelector(
    "#sf_fieldset_dane_dostawy"
  );

  const form = document.createElement("form");
  form.id = "apaczkaForm";
  form.style.marginTop = "20px";
  form.style.padding = "15px";

  function createFormField(label, type, name, unit = "") {
    const div = document.createElement("div");
    div.style.marginBottom = "15px";
    div.style.display = "flex";
    div.style.alignItems = "center";

    const labelElement = document.createElement("label");
    labelElement.textContent = `${label}: `;
    labelElement.setAttribute("for", name);
    labelElement.style.flexBasis = "40%";
    labelElement.style.marginRight = "10px";

    const input = document.createElement("input");
    input.type = type;
    input.id = name;
    input.name = name;
    input.style.flexGrow = "1";
    input.style.border = "1px solid #ced4da";

    div.appendChild(labelElement);
    div.appendChild(input);

    if (unit) {
      const unitSpan = document.createElement("span");
      unitSpan.textContent = ` ${unit}`;
      unitSpan.style.marginLeft = "5px";
      div.appendChild(unitSpan);
    }

    return div;
  }

  form.appendChild(createFormField("Długość", "number", "length", "cm"));
  form.appendChild(createFormField("Szerokość", "number", "width", "cm"));
  form.appendChild(createFormField("Wysokość", "number", "height", "cm"));
  form.appendChild(createFormField("Waga", "number", "weight", "kg"));
  form.appendChild(createFormField("Zawartość przesyłki", "text", "content"));
  form.appendChild(createFormField("Dodatkowy komentarz", "text", "comment"));
  form.appendChild(
    createFormField("Deklarowana wartość", "number", "declaredValue", "PLN")
  );
  form.appendChild(
    createFormField("Kwota pobrania", "number", "codAmount", "PLN")
  );

  // Dodawanie checkboxów
  const checkboxes = [
    "Bez drukowania etykiety",
    "Powiadomienie SMS",
    "Zwrot dokumentów",
    "Dostawa w sobotę",
  ];

  checkboxes.forEach((label) => {
    const div = document.createElement("div");
    div.style.marginBottom = "10px";
    div.style.display = "flex";
    div.style.alignItems = "center";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = label.toLowerCase().replace(/ /g, "_");
    checkbox.name = checkbox.id;
    checkbox.style.marginRight = "10px";

    const checkboxLabel = document.createElement("label");
    checkboxLabel.setAttribute("for", checkbox.id);
    checkboxLabel.textContent = label;

    div.appendChild(checkbox);
    div.appendChild(checkboxLabel);
    form.appendChild(div);
  });

  sf_fieldset_dane_dostawy.appendChild(form);

  const button = document.createElement("button");
  button.textContent = "Wyślij dane do apaczka";
  button.style.marginTop = "15px";
  button.style.padding = "10px 15px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.transition = "background-color 0.3s";

  button.addEventListener("mouseover", function () {
    this.style.backgroundColor = "#0056b3";
  });

  button.addEventListener("mouseout", function () {
    this.style.backgroundColor = "#007bff";
  });

  button.addEventListener("click", function () {
    const addressElement = document.querySelector(
      "#sf_fieldset_dane_dostawy > div > div .st-order-user-data"
    );

    const data = {
      name: addressElement
        .querySelector(".st_order-address-name")
        .textContent.trim(),
      street: addressElement
        .querySelector(".st_order-address-street")
        .textContent.trim(),
      province: addressElement
        .querySelectorAll(".st_order-address-street")[1]
        .textContent.trim(),
      postalCode: addressElement
        .querySelector(".st_order-address-code")
        .textContent.trim(),
      city: addressElement
        .querySelector(".st_order-address-town")
        .textContent.trim(),
      country: addressElement
        .querySelector(".st_order-address-country")
        .textContent.trim(),
      phone: addressElement.querySelector("p:last-child").textContent.trim(),
    };

    const formData = new FormData(document.getElementById("apaczkaForm"));
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    checkboxes.forEach((label) => {
      const id = label.toLowerCase().replace(/ /g, "_");
      data[id] = document.getElementById(id).checked;
    });

    fetch("http://localhost:3000/api/apaczka", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "token!",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Sukces:", data);
      })
      .catch((error) => {
        console.error("Błąd:", error);
      });
  });

  sf_fieldset_dane_dostawy.appendChild(button);
})();
