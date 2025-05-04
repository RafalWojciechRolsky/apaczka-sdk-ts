// ==UserScript==
// @name         httpPostApaczka
// @namespace    http://tampermonkey.net/
// @version      2024-09-09
// @description  Wysyłka danych klienta do Apaczki, rejestracja klienta
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
  form.style.borderTop = "1px solid #ccc";
  form.style.backgroundColor = "#f9f9f9";

  function createFormField(label, type, name, value = "") {
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
    input.value = value;
    input.style.flexGrow = "1";
    input.style.border = "1px solid #ced4da";
    input.style.padding = "5px";

    div.appendChild(labelElement);
    div.appendChild(input);

    return div;
  }

  // Pobieramy dane klienta do wypełnienia formularza
  let customerName = "";
  let customerEmail = "";
  let customerCompanyName = "";
  let contactPerson = "";

  // Pobieranie nazwy klienta z adresu dostawy
  const deliveryElement = document.querySelector(
    ".row_order_user_delivery_data > address:nth-child(1) > p:nth-child(1)"
  );

  if (deliveryElement) {
    customerName = deliveryElement.textContent.trim();
  }

  // Pobieranie osoby kontaktowej
  const contactPersonElement = document.querySelector(
    ".row_order_user_delivery_data > address:nth-child(1) > p:nth-child(1) > span:nth-child(1)"
  );

  if (contactPersonElement) {
    contactPerson = contactPersonElement.textContent.trim();
  }

  // Pobieranie emaila
  const emailElement = document.querySelector(
    "span.align-middle > a:nth-child(1)"
  );
  if (emailElement) {
    customerEmail = emailElement.textContent.trim();
  }

  // Pobieranie nazwy firmy
  const companyElement = document.querySelector(
    ".row_order_user_billing_data > address:nth-child(1) > p:nth-child(1)"
  );
  if (companyElement && companyElement.textContent.trim() !== "") {
    customerCompanyName = companyElement.textContent.trim();
  } else {
    // Jeśli nie ma nazwy firmy, używamy nazwy klienta
    customerCompanyName = customerName;
  }

  // Adres dla pozostałych pól
  const addressElement = document.querySelector(
    "#sf_fieldset_dane_dostawy > div > div .st-order-user-data"
  );

  // Dodajemy pola z domyślnymi wartościami, ale możliwe do edycji
  const nameField = createFormField(
    "Nazwa firmy / Imię i nazwisko",
    "text",
    "name",
    customerName
  );
  form.appendChild(nameField);

  form.appendChild(createFormField("Email", "email", "email", customerEmail));
  form.appendChild(
    createFormField("Osoba kontaktowa", "text", "contactPerson", contactPerson)
  );

  // Dodajemy pozostałe pola adresowe z możliwością edycji
  if (addressElement) {
    const street =
      addressElement
        .querySelector(".st_order-address-street")
        ?.textContent.trim() || "";
    const province =
      addressElement
        .querySelectorAll(".st_order-address-street")[1]
        ?.textContent.trim() || "";
    const postalCode =
      addressElement
        .querySelector(".st_order-address-code")
        ?.textContent.trim() || "";
    const city =
      addressElement
        .querySelector(".st_order-address-town")
        ?.textContent.trim() || "";
    const country =
      addressElement
        .querySelector(".st_order-address-country")
        ?.textContent.trim() || "";
    const phone =
      addressElement.querySelector("p:last-child")?.textContent.trim() || "";

    // Rozdzielamy adres na ulicę, numer budynku i numer lokalu
    // W tym przykładzie trzeba będzie ręcznie uzupełnić te pola
    let streetName = "";
    let buildingNumber = "";
    let apartmentNumber = "";

    // Próba automatycznego rozdzielenia ulicy na części
    if (street) {
      // Szukamy numeru budynku - zakładamy, że jest na końcu i poprzedzony spacją
      const streetParts = street.match(
        /^(.*?)\s+(\d+[a-zA-Z]?)\s*(?:\/|m\.|m|lok\.|lok|mieszkanie|mieszk\.)\s*(\d+[a-zA-Z]?)?$/i
      );

      if (streetParts) {
        // Mamy ulicę, numer budynku i numer mieszkania
        streetName = streetParts[1].trim();
        buildingNumber = streetParts[2].trim();
        apartmentNumber = streetParts[3] ? streetParts[3].trim() : "";
      } else {
        // Spróbujmy dopasować tylko ulicę i numer budynku
        const simpleParts = street.match(/^(.*?)\s+(\d+[a-zA-Z]?)$/);
        if (simpleParts) {
          streetName = simpleParts[1].trim();
          buildingNumber = simpleParts[2].trim();
        } else {
          // Nie udało się rozdzielić, więc całość traktujemy jako nazwę ulicy
          streetName = street;
        }
      }
    }

    form.appendChild(createFormField("Ulica", "text", "street", streetName));
    form.appendChild(
      createFormField("Numer budynku", "text", "buildingNumber", buildingNumber)
    );
    form.appendChild(
      createFormField(
        "Numer lokalu",
        "text",
        "apartmentNumber",
        apartmentNumber
      )
    );
    form.appendChild(
      createFormField("Województwo", "text", "province", province)
    );
    form.appendChild(
      createFormField("Kod pocztowy", "text", "postalCode", postalCode)
    );
    form.appendChild(createFormField("Miasto", "text", "city", city));
    form.appendChild(createFormField("Kraj", "text", "country", country));
    form.appendChild(createFormField("Telefon", "text", "phone", phone));
  }

  sf_fieldset_dane_dostawy.appendChild(form);

  const button = document.createElement("button");
  button.textContent = "Zarejestruj klienta w apaczka";
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

  button.addEventListener("click", function (e) {
    e.preventDefault(); // Zapobiegamy przeładowaniu strony

    // Zbieramy dane klienta z formularza bezpośrednio z elementów DOM
    const form = document.getElementById("apaczkaForm");
    const customerData = {};
    
    // Pobieramy wszystkie inputy z formularza
    const inputs = form.querySelectorAll("input");
    
    // Iterujemy po inputach i zapisujemy niepuste wartości
    inputs.forEach(input => {
      if (input.value) {
        customerData[input.name] = input.value;
      }
    });

    console.log("Wysyłam dane do API:", JSON.stringify(customerData, null, 2));
    
    fetch("http://localhost:3000/api/apaczka/customer-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "token!",
      },
      body: JSON.stringify(customerData),
    })
      .then((response) => {
        console.log("Odpowiedź z API (status):", response.status);
        console.log("Odpowiedź z API (statusText):", response.statusText);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Sukces: Klient zarejestrowany", data);
        // Dodaj powiadomienie o sukcesie
        const successMsg = document.createElement("div");
        successMsg.textContent = "Klient został pomyślnie zarejestrowany!";
        successMsg.style.color = "green";
        successMsg.style.marginTop = "10px";
        successMsg.style.padding = "5px";
        form.appendChild(successMsg);

        // Usuń powiadomienie po 3 sekundach
        setTimeout(() => {
          form.removeChild(successMsg);
        }, 3000);
      })
      .catch((error) => {
        console.error("Błąd:", error);
        // Dodaj powiadomienie o błędzie
        const errorMsg = document.createElement("div");
        errorMsg.textContent = "Wystąpił błąd podczas rejestracji klienta.";
        errorMsg.style.color = "red";
        errorMsg.style.marginTop = "10px";
        errorMsg.style.padding = "5px";
        form.appendChild(errorMsg);

        // Usuń powiadomienie po 3 sekundach
        setTimeout(() => {
          form.removeChild(errorMsg);
        }, 3000);
      });
  });

  sf_fieldset_dane_dostawy.appendChild(button);
})();
