// ==UserScript==
// @name         greasyScriptForApaczka
// @namespace    https://greasyfork.org/
// @version      2024-09-11
// @description  Injected script on the user's page via greasyfork.org scripts. Sending data to Apaczka API, creating a shipping label.
// @author       Rafał Majewski
// @match        https://skladmuzyczny.pl/backend.php/order/edit/id/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skladmuzyczny.pl
// @grant        window.onurlchange
// ==/UserScript==

(function () {
  "use strict";
  const adminEditForm = document.querySelector("#admin_edit_form");
  const sfFieldsetZawartosc = document.querySelector("#sf_fieldset_zawartosc");

  const form = document.createElement("form");
  form.id = "apaczkaForm";
  form.style.marginTop = "20px";
  form.style.padding = "15px";
  form.style.border = "1px solid #ced4da";
  form.style.borderRadius = "5px";
  form.style.width = "100%";
  form.style.boxSizing = "border-box";

  function createSection(title) {
    const section = document.createElement("fieldset");
    section.style.marginBottom = "20px";
    section.style.padding = "10px";
    section.style.border = "1px solid #ced4da";
    section.style.borderRadius = "5px";

    const legend = document.createElement("legend");
    legend.textContent = title;
    legend.style.fontWeight = "bold";
    section.appendChild(legend);

    return section;
  }

  function createFormField(label, type, name, options = {}) {
    const div = document.createElement("div");
    div.style.marginBottom = "15px";
    div.style.display = "flex";
    div.style.alignItems = "center";

    const labelElement = document.createElement("label");
    labelElement.textContent = `${label}: `;
    labelElement.setAttribute("for", name);
    labelElement.style.flexBasis = "40%";
    labelElement.style.marginRight = "10px";

    let input;
    if (type === "select") {
      input = document.createElement("select");
      options.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        input.appendChild(option);
      });
    } else {
      input = document.createElement("input");
      input.type = type;
    }
    input.id = name;
    input.name = name;
    input.style.flexGrow = "1";
    input.style.border = "1px solid #ced4da";
    input.style.padding = "5px";

    if (options.value) {
      input.value = options.value;
    }

    div.appendChild(labelElement);
    div.appendChild(input);

    if (options.unit) {
      const unitSpan = document.createElement("span");
      unitSpan.textContent = ` ${options.unit}`;
      unitSpan.style.marginLeft = "5px";
      div.appendChild(unitSpan);
    }

    return div;
  }

  // Section 1: Miejsce nadania i dostawy przesyłki
  const section1 = createSection("1. Miejsce nadania i dostawy przesyłki");

  // Dane nadawcy (domyślne, ale edytowalne)
  const senderInfo = document.createElement("div");
  senderInfo.innerHTML = "<h4>Dane Nadawcy:</h4>";
  senderInfo.appendChild(
    createFormField("Kraj", "select", "senderCountry", {
      options: [{ value: "PL", text: "Polska [PL]" }],
    })
  );
  senderInfo.appendChild(
    createFormField("Nazwa", "text", "senderName", {
      value: "Skladmuzyczny.pl",
    })
  );
  senderInfo.appendChild(
    createFormField("Ulica i numer", "text", "senderStreet", {
      value: "ul. Skawińska 14",
    })
  );
  senderInfo.appendChild(
    createFormField("Kod pocztowy", "text", "senderPostalCode", {
      value: "31-066",
    })
  );
  senderInfo.appendChild(
    createFormField("Miasto", "text", "senderCity", {
      value: "Kraków",
    })
  );
  senderInfo.appendChild(
    createFormField("Osoba kontaktowa", "text", "senderContactPerson", {
      value: "Rafał Majewski",
    })
  );
  senderInfo.appendChild(
    createFormField("Email", "email", "senderEmail", {
      value: "zamowienia@skladmuzyczny.pl",
    })
  );
  senderInfo.appendChild(
    createFormField("Telefon", "tel", "senderPhone", {
      value: "123461842",
    })
  );

  section1.appendChild(senderInfo);

  // Dane odbiorcy (formularz)
  const receiverInfo = document.createElement("div");
  receiverInfo.innerHTML = "<h4>Dane odbiorcy:</h4>";
  receiverInfo.appendChild(
    createFormField("Kraj", "select", "receiverCountry", {
      options: [{ value: "PL", text: "Polska [PL]" }],
    })
  );
  receiverInfo.appendChild(
    createFormField("Imię i nazwisko", "text", "receiverName")
  );
  receiverInfo.appendChild(
    createFormField("Ulica i numer", "text", "receiverStreet")
  );
  receiverInfo.appendChild(
    createFormField("Kod pocztowy", "text", "receiverPostalCode")
  );
  receiverInfo.appendChild(createFormField("Miasto", "text", "receiverCity"));
  receiverInfo.appendChild(
    createFormField("Osoba kontaktowa", "text", "receiverContactPerson")
  );
  receiverInfo.appendChild(createFormField("Email", "email", "receiverEmail"));
  receiverInfo.appendChild(createFormField("Telefon", "tel", "receiverPhone"));

  section1.appendChild(receiverInfo);
  form.appendChild(section1);

  // Section 2: Rodzaj przesyłki
  const section2 = createSection("2. Rodzaj przesyłki");
  const packageTypes = [
    {
      value: "PACZKA",
      text: "Paczka - Przesyłka zapakowana w prostopadłościenny karton o regularnych kształtach, bez wystających elementów lub w foliopak kurierski.",
    },
    {
      value: "LIST",
      text: "List - Przesyłka zawierająca dokumenty w wersji papierowej, zapakowane w kopertę kurierską.",
    },
    {
      value: "PALETA",
      text: "Paleta - Towar na palecie Euro o podstawie 120x80. Bez elementów wystających poza obrys palety.",
    },
    {
      value: "PALETA_60X40",
      text: "Paleta 60x40 - Towar na palecie o podstawie 60x40. Bez elementów wystających poza obrys palety.",
    },
    {
      value: "POLPALETA",
      text: "Półpaleta - Towar na palecie o podstawie 60x80. Bez elementów wystających poza obrys palety.",
    },
    {
      value: "PALETA_PRZEMYSLOWA",
      text: "Paleta przemysłowa - Towar na palecie o podstawie 120x100. Bez elementów wystających poza obrys palety.",
    },
    {
      value: "PALETA_PRZEMYSLOWA_B",
      text: "Paleta przemysłowa B - Towar na palecie o podstawie 120x120. Bez elementów wystających poza obrys palety.",
    },
  ];
  section2.appendChild(
    createFormField("Rodzaj przesyłki", "select", "packageType", {
      options: packageTypes,
    })
  );

  const packageTypeSelect = section2.querySelector("#packageType");
  packageTypeSelect.value = "PACZKA";

  form.appendChild(section2);

  // Section 3: Wymiary i waga
  const section3 = createSection("3. Wymiary i waga");
  section3.appendChild(
    createFormField("Długość", "number", "length", { unit: "cm" })
  );
  section3.appendChild(
    createFormField("Szerokość", "number", "width", { unit: "cm" })
  );
  section3.appendChild(
    createFormField("Wysokość", "number", "height", { unit: "cm" })
  );
  section3.appendChild(
    createFormField("Waga", "number", "weight", { unit: "kg" })
  );
  const nonStandardCheckbox = createFormField(
    "Przesyłka niestandardowa",
    "checkbox",
    "isNonStandard"
  );
  nonStandardCheckbox.style.marginTop = "10px";
  section3.appendChild(nonStandardCheckbox);
  form.appendChild(section3);

  // Section 4: Dodatkowe informacje i usługi
  const section4 = createSection("4. Dodatkowe informacje i usługi");
  section4.appendChild(
    createFormField("Zawartość przesyłki", "text", "content")
  );
  section4.appendChild(
    createFormField("Dodatkowy komentarz", "text", "comment")
  );
  section4.appendChild(
    createFormField("Deklarowana wartość", "number", "declaredValue", {
      unit: "PLN",
    })
  );
  section4.appendChild(
    createFormField("Kwota pobrania", "number", "codAmount", { unit: "PLN" })
  );

  const additionalServices = [
    "Bez drukowania etykiety",
    "Powiadomienie SMS",
    "Zwrot dokumentów",
    "Dostawa w sobotę",
    "Podjazd z listem",
    "Ostrożnie",
    "Przesyłka zwrotna",
    "Dostawa do rąk własnych",
    "Sprawdzenie zawartości",
    "Opony",
    "Przedmioty kruche",
    "Płyny lub gazy",
    "Żywe rośliny",
    "Żywe owady",
    "Żywe ptaki",
  ];

  additionalServices.forEach((service) => {
    const checkbox = createFormField(
      service,
      "checkbox",
      service.toLowerCase().replace(/ /g, "_")
    );
    checkbox.style.marginBottom = "10px";
    section4.appendChild(checkbox);
  });

  form.appendChild(section4);

  adminEditForm.insertBefore(form, sfFieldsetZawartosc);

  // Kontener na przyciski
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "flex-start";
  buttonContainer.style.gap = "10px";
  buttonContainer.style.marginTop = "15px";

  // Przycisk "Wyceń"
  const valuationButton = document.createElement("button");
  valuationButton.textContent = "Wyceń";
  valuationButton.style.padding = "10px 15px";
  valuationButton.style.backgroundColor = "#007bff";
  valuationButton.style.color = "white";
  valuationButton.style.border = "none";
  valuationButton.style.cursor = "pointer";
  valuationButton.style.transition = "background-color 0.3s";

  // Przycisk "Wyślij zlecenie"
  const sendOrderButton = document.createElement("button");
  sendOrderButton.textContent = "Wyślij zlecenie";
  sendOrderButton.style.padding = "10px 15px";
  sendOrderButton.style.backgroundColor = "#28a745";
  sendOrderButton.style.color = "white";
  sendOrderButton.style.border = "none";
  sendOrderButton.style.cursor = "pointer";
  sendOrderButton.style.transition = "background-color 0.3s";

  // Dodanie efektu hover do przycisków
  [valuationButton, sendOrderButton].forEach((button) => {
    button.addEventListener("mouseover", function () {
      this.style.opacity = "0.8";
    });

    button.addEventListener("mouseout", function () {
      this.style.opacity = "1";
    });
  });

  // Funkcja do pobierania danych z formularza
  function getFormData() {
    const data = {
      address: {
        sender: {
          country_code: document.getElementById("senderCountry").value,
          name: document.getElementById("senderName").value,
          line1: document.getElementById("senderStreet").value,
          line2: "",
          postal_code: document.getElementById("senderPostalCode").value,
          city: document.getElementById("senderCity").value,
          is_residential: 0,
          contact_person: document.getElementById("senderContactPerson").value,
          email: document.getElementById("senderEmail").value,
          phone: document.getElementById("senderPhone").value,
        },
        receiver: {
          country_code: document.getElementById("receiverCountry").value,
          name: document.getElementById("receiverName").value,
          line1: document.getElementById("receiverStreet").value,
          line2: "",
          postal_code: document.getElementById("receiverPostalCode").value,
          city: document.getElementById("receiverCity").value,
          is_residential: 1,
          contact_person: document.getElementById("receiverContactPerson")
            .value,
          email: document.getElementById("receiverEmail").value,
          phone: document.getElementById("receiverPhone").value,
        },
      },
    };

    const formData = new FormData(document.getElementById("apaczkaForm"));
    for (let [key, value] of formData.entries()) {
      if (!key.startsWith("receiver") && !key.startsWith("sender")) {
        data[key] = value;
      }
    }

    additionalServices.forEach((service) => {
      const id = service.toLowerCase().replace(/ /g, "_");
      data[id] = document.getElementById(id).checked;
    });

    return data;
  }

  // Funkcja do wysyłania żądania
  function sendRequest(endpoint, data) {
    return fetch(`http://localhost:3000/api/apaczka/${endpoint}`, {
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
        console.log(`Sukces (${endpoint}):`, data);
        return data;
      })
      .catch((error) => {
        console.error(`Błąd (${endpoint}):`, error);
        throw error;
      });
  }

  // Obsługa kliknięcia przycisku "Wyceń"
  valuationButton.addEventListener("click", function (e) {
    e.preventDefault();
    const data = getFormData();
    sendRequest("order-valuation", data);
  });

  // Obsługa kliknięcia przycisku "Wyślij zlecenie"
  sendOrderButton.addEventListener("click", function (e) {
    e.preventDefault();
    const data = getFormData();
    sendRequest("order-send", data);
  });

  // Dodanie przycisków do kontenera
  buttonContainer.appendChild(valuationButton);
  buttonContainer.appendChild(sendOrderButton);

  // Dodanie kontenera z przyciskami do formularza
  form.appendChild(buttonContainer);
})();
