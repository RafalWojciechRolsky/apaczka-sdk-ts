// ==UserScript==
// @name         httpPostApaczka
// @namespace    http://tampermonkey.net/
// @version      2024-09-09
// @description  Wysyłka danych klienta do Apaczki, rejestracja klienta
// @author       Rafał
// @match        https://skladmuzyczny.pl/backend.php/order/edit/id/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=skladmuzyczny.pl
// @grant        window.onurlchange
// @grant        GM.xmlHttpRequest
// @connect      http://localhost:3000
// ==/UserScript==

(function () {
  "use strict";
  // Helper do POST przez Tampermonkey – eliminuje mixed-content (HTTPS→HTTP)
  function tmPost(path, body) {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: "POST",
        url: `http://localhost:3000${path}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: "token!",
        },
        data: JSON.stringify(body),
        responseType: "json",
        onload: (resp) => {
          if (resp.status >= 200 && resp.status < 300) {
            resolve(resp.response);
          } else {
            reject(
              new Error(`HTTP ${resp.status}: ${resp.statusText || "error"}`)
            );
          }
        },
        onerror: (err) => reject(err),
      });
    });
  }

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
    input.style.boxSizing = "border-box";
    input.style.minWidth = "0";
    input.style.width = "100%";

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

  // Dodajemy stylowany kontener dla całego formularza i elementów Apaczki
  const apaczkaContainer = document.createElement("div");
  apaczkaContainer.id = "apaczkaContainer";
  apaczkaContainer.style.marginTop = "20px";
  apaczkaContainer.style.padding = "15px";
  apaczkaContainer.style.borderTop = "1px solid #ccc";
  apaczkaContainer.style.backgroundColor = "#f9f9f9";

  // Tytuł formularza
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Nadaj paczkę przez Apaczkę";
  formTitle.style.margin = "0 0 15px 0";
  formTitle.style.color = "#333";
  formTitle.style.fontSize = "18px";
  apaczkaContainer.appendChild(formTitle);

  // Formularz wewnątrz kontenera
  apaczkaContainer.appendChild(form);

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

  /* =======================================================================
   *  SEKCJA DANYCH DOTYCZĄCYCH NADANIA PACZKI (Apaczka OrderRequest)
   * =====================================================================*/

  // 1. Domyślna zawartość przesyłki → "Zamówienie XXXX <nazwa najdroższego produktu>"
  // Pobieramy numer zamówienia z URL (#/id/<orderId>)
  const orderIdMatch = window.location.pathname.match(/\/id\/(\d+)/);
  const orderId = orderIdMatch ? orderIdMatch[1] : "";

  // Pobieramy nazwę najdroższego produktu z tabeli #st_order-product-list
  let mostExpensiveProductName = "produkt";
  try {
    const productRows = document.querySelectorAll(
      "#st_order-product-list tbody tr"
    );
    let maxPrice = 0;
    productRows.forEach((row) => {
      const priceCell = row.querySelector(
        "td.text-right.text-nowrap:last-child"
      );
      const nameCell = row.querySelector("td.st_record_list-item-name a");
      if (priceCell && nameCell) {
        const priceText = priceCell.textContent
          .replace(/[^0-9,]/g, "")
          .replace(",", ".");
        const price = parseFloat(priceText);
        if (price > maxPrice) {
          maxPrice = price;
          mostExpensiveProductName = nameCell.textContent.trim();
        }
      }
    });
  } catch (_) {}

  const defaultContent = `Zamówienie ${orderId} ${mostExpensiveProductName}`;

  // 2. Pobieramy deklarowaną wartość przesyłki (wartość zamówienia)
  const declaredValueText =
    document
      .querySelector("#order-total-amount-container")
      ?.textContent.replace(/[^0-9,]/g, "")
      .replace(",", ".") || "0";
  const declaredValue = parseFloat(declaredValueText);

  // 3. Pobieramy potencjalną kwotę pobrania (pozostało do zapłaty)
  const codAmountText =
    document
      .querySelector("#order-left-to-pay-amount-container")
      ?.textContent.replace(/[^0-9,]/g, "")
      .replace(",", ".") || "0";
  const codAmount = parseFloat(codAmountText);

  // 4. Tworzymy pola formularza dla danych paczki
  form.appendChild(
    createFormField("Długość (cm)", "number", "dimension1", "10")
  );
  form.appendChild(
    createFormField("Szerokość (cm)", "number", "dimension2", "10")
  );
  form.appendChild(
    createFormField("Wysokość (cm)", "number", "dimension3", "10")
  );
  form.appendChild(createFormField("Waga (kg)", "number", "weight", "1"));

  // Deklarowana wartość
  form.appendChild(
    createFormField(
      "Deklarowana wartość (PLN)",
      "number",
      "shipment_value",
      declaredValue.toString()
    )
  );

  // Kwota pobrania (opcjonalnie)
  form.appendChild(
    createFormField(
      "Kwota pobrania (PLN) – zostaw 0 jeżeli brak",
      "number",
      "cod_amount",
      codAmount > 0 ? codAmount.toString() : "0"
    )
  );

  form.appendChild(
    createFormField("Zawartość przesyłki", "text", "content", defaultContent)
  );

  // Ukryte pole na service_id (wypełnione po wycenie)
  const serviceIdInput = document.createElement("input");
  serviceIdInput.type = "hidden";
  serviceIdInput.id = "service_id";
  serviceIdInput.name = "service_id";
  form.appendChild(serviceIdInput);

  // Kontener pod przyciski
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.gap = "10px";
  buttonsContainer.style.marginTop = "15px";
  form.appendChild(buttonsContainer);

  /* ------------------- PRZYCISK 1 – WYCENA ------------------- */
  const quoteButton = document.createElement("button");
  quoteButton.textContent = "Wycena";
  quoteButton.style.padding = "10px 15px";
  quoteButton.style.backgroundColor = "#6c757d";
  quoteButton.style.color = "white";
  quoteButton.style.border = "none";
  quoteButton.style.cursor = "pointer";
  quoteButton.disabled = true; // aktywujemy po wypełnieniu pól

  // Funkcja sprawdzająca czy wymagane pola są wypełnione
  function checkQuoteReady() {
    const d1 = form.querySelector("#dimension1").value;
    const d2 = form.querySelector("#dimension2").value;
    const d3 = form.querySelector("#dimension3").value;
    const w = form.querySelector("#weight").value;
    quoteButton.disabled = !(d1 && d2 && d3 && w);
    quoteButton.style.backgroundColor = quoteButton.disabled
      ? "#6c757d"
      : "#17a2b8";
  }
  form.addEventListener("input", checkQuoteReady);
  checkQuoteReady();

  quoteButton.addEventListener("click", function (e) {
    e.preventDefault();
    const orderData = buildOrderData();
    console.log("Wysyłam dane do /api/apaczka/order-valuation", orderData);

    // Wyświetlenie informacji o ładowaniu
    const loadingInfo = document.createElement("div");
    loadingInfo.textContent = "Trwa wycena...";
    loadingInfo.style.marginTop = "10px";
    loadingInfo.style.color = "#007bff";
    form.appendChild(loadingInfo);

    tmPost("/api/apaczka/order-valuation", orderData)
      .then((response) => {
        // Usunięcie informacji o ładowaniu
        form.removeChild(loadingInfo);

        // Sprawdzamy, czy odpowiedź zawiera informację o błędzie
        if (response.status === 400 || response.status === 500) {
          console.error("Błąd API:", response);
          alert(`Błąd wyceny: ${response.message || "Nieznany błąd"}`);
          return;
        }

        // API zwraca obiekt w strukturze: { status, message, response: { price_table } }
        console.log("Otrzymana wycena (cała odpowiedź):", response);

        if (!response.response || !response.response.price_table) {
          console.error("Brak tabeli cen w odpowiedzi");
          alert("Błąd: Nie otrzymano informacji o cenach");
          return;
        }

        const priceTable = response.response.price_table;
        console.log("Dostępne usługi w price_table:", Object.keys(priceTable));

        // Sprawdzamy jakie ID przewoźników są dostępne
        console.log(
          "Lista wszystkich dostępnych przewoźników:",
          Object.keys(priceTable).join(", ")
        );

        // Aktualizacja kafelków z cenami - tylko dla ID 21 i 42
        document.querySelectorAll(".carrier-tile").forEach((tile) => {
          const serviceId = tile.dataset.serviceId;
          if (priceTable[serviceId]) {
            const priceElement = tile.querySelector(".carrier-price");
            const priceBrutto = priceTable[serviceId].price_gross;
            const priceNetto = priceTable[serviceId].price;

            priceElement.innerHTML = `<strong>${(priceBrutto / 100).toFixed(
              2
            )} zł</strong><br><small>${(priceNetto / 100).toFixed(
              2
            )} zł netto</small>`;

            // Aktywujemy kafelek
            tile.style.opacity = "1";
            tile.style.cursor = "pointer";
          } else {
            const priceElement = tile.querySelector(".carrier-price");
            priceElement.textContent = "Niedostępny";
            tile.style.opacity = "0.5";
            tile.style.cursor = "not-allowed";
          }
        });

        // Nie dodajemy nowych kafelków dla innych przewoźników

        // Jeśli InPost Kurier (ID 42) jest dostępny, sugerujemy go automatycznie
        // W przeciwnym razie sugerujemy DPD Kurier (ID 21)
        let suggestedServiceId = null;

        if (priceTable["42"]) {
          suggestedServiceId = "42";
        } else if (priceTable["21"]) {
          suggestedServiceId = "21";
        }

        if (suggestedServiceId) {
          const suggestedTile = document.querySelector(
            `.carrier-tile[data-service-id="${suggestedServiceId}"]`
          );
          if (suggestedTile) {
            // Symulujemy kliknięcie
            suggestedTile.click();
          }
        }
      })
      .catch((error) => {
        // Usunięcie informacji o ładowaniu
        form.removeChild(loadingInfo);
        console.error("Błąd podczas wyceny:", error);
        alert(`Wystąpił błąd: ${error.message}`);
      });
  });
  buttonsContainer.appendChild(quoteButton);

  /* ---------------- PRZYCISK 2 – NADANIE PACZKI ---------------- */
  const button = document.createElement("button");
  button.textContent = "Nadaj paczkę w Apaczka";
  button.style.padding = "10px 15px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.transition = "background-color 0.3s";

  // przycisk aktywny po wycenie (gdy ustawiono service_id)
  function checkSendReady() {
    button.disabled = serviceIdInput.value === "";
    button.style.backgroundColor = button.disabled ? "#6c757d" : "#007bff";
  }
  checkSendReady();
  serviceIdInput.addEventListener("change", checkSendReady);

  button.addEventListener("click", function (e) {
    e.preventDefault();

    const orderData = buildOrderData();

    if (!orderData.service_id) {
      alert("Najpierw wykonaj wycenę i wybierz przewoźnika");
      return;
    }

    console.log("Wysyłam dane do /api/apaczka/order-send", orderData);

    tmPost("/api/apaczka/order-send", orderData).then((data) => {
      console.log("Sukces: Paczka nadana", data);
      const successMsg = document.createElement("div");
      successMsg.textContent = "Paczka została pomyślnie nadana!";
      successMsg.style.color = "green";
      successMsg.style.marginTop = "10px";
      successMsg.style.padding = "5px";
      form.appendChild(successMsg);
      setTimeout(() => form.removeChild(successMsg), 3000);
    });
  });

  buttonsContainer.appendChild(button);

  /* ---------------- POMOCNICZA FUNKCJA BUDUJĄCA OrderRequest ---------------- */
  function buildOrderData() {
    const data = {};
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((inp) => {
      if (inp.name && inp.value !== "") {
        if (inp.type === "checkbox") {
          data[inp.name] = inp.checked ? 1 : 0;
        } else {
          data[inp.name] = inp.value;
        }
      }
    });

    // Konwersje do odpowiednich typów/liczb
    [
      "dimension1",
      "dimension2",
      "dimension3",
      "weight",
      "shipment_value",
      "cod_amount",
    ].forEach((k) => {
      if (data[k]) data[k] = Number(data[k]);
    });

    // Upewniamy się, że wszystkie wymagane dane są ustawione
    if (!data.name) data.name = "Skladmuzyczny.pl";
    if (!data.street) data.street = "ul. Skawińska";
    if (!data.buildingNumber) data.buildingNumber = "14";
    if (!data.postalCode) data.postalCode = "31-066";
    if (!data.city) data.city = "Kraków";
    if (!data.country) data.country = "PL";
    if (!data.phone) data.phone = "123461842";
    if (!data.email) data.email = "zamowienia@skladmuzyczny.pl";

    // Budujemy strukturę zgodną z OrderRequest (uproszczoną)
    const orderRequest = {
      service_id: data.service_id ? Number(data.service_id) : undefined,
      address: {
        sender: {
          country_code: "PL",
          name: "Skladmuzyczny.pl",
          line1: `${data.street} ${data.buildingNumber}`,
          line2: data.apartmentNumber || "",
          postal_code: data.postalCode || "31-066",
          city: data.city || "Kraków",
          is_residential: 0,
          contact_person: "Rafał Majewski",
          email: "zamowienia@skladmuzyczny.pl",
          phone: "123461842",
        },
        receiver: {
          country_code: "PL",
          name: data.name,
          line1: `${data.street} ${data.buildingNumber}`,
          line2: data.apartmentNumber || "",
          postal_code: data.postalCode,
          city: data.city,
          is_residential: 1,
          contact_person: data.contactPerson || data.name,
          email: data.email,
          phone: data.phone,
        },
      },
      option: {},
      shipment_value: data.shipment_value || 0,
      pickup: {
        type: "SELF",
        date: new Date().toISOString().split("T")[0], // Aktualna data w formacie YYYY-MM-DD
        hours_from: "09:00",
        hours_to: "17:00",
      },
      shipment: [
        {
          dimension1: data.dimension1 || 10,
          dimension2: data.dimension2 || 10,
          dimension3: data.dimension3 || 10,
          shipment_type_code: "PACZKA",
          weight: data.weight || 1,
          is_nstd: 0,
        },
      ],
      comment: data.comment || "Komentarz",
      content: data.content || "Test",
    };
    return orderRequest;
  }

  // Kontener na kafelki przewoźników
  const carriersContainer = document.createElement("div");
  carriersContainer.style.marginTop = "20px";
  carriersContainer.style.marginBottom = "20px";

  const carriersTitle = document.createElement("h4");
  carriersTitle.textContent = "Dostępni przewoźnicy";
  carriersTitle.style.margin = "10px 0";
  carriersTitle.style.color = "#444";
  carriersTitle.style.fontSize = "16px";
  carriersContainer.appendChild(carriersTitle);

  const carriersGrid = document.createElement("div");
  carriersGrid.style.display = "grid";
  carriersGrid.style.gridTemplateColumns =
    "repeat(auto-fill, minmax(200px, 1fr))";
  carriersGrid.style.gap = "15px";
  carriersGrid.style.marginTop = "10px";
  carriersContainer.appendChild(carriersGrid);

  // Zdefiniowanie map nazw przewoźników po ID
  const carrierNames = {
    21: "DPD Kurier",
    42: "InPost Kurier",
  };

  // Zdefiniowanie kolorów dla przewoźników
  const carrierColors = {
    21: "#dc0032", // DPD
    42: "#ffcc00", // InPost
    default: "#6c757d", // Domyślny kolor
  };

  // Funkcja tworząca kafelek przewoźnika
  function createCarrierTile(serviceId, name, price = null) {
    const carrierTile = document.createElement("div");
    carrierTile.classList.add("carrier-tile");
    carrierTile.dataset.serviceId = serviceId;
    carrierTile.style.border = "1px solid #ddd";
    carrierTile.style.borderRadius = "5px";
    carrierTile.style.padding = "15px";
    carrierTile.style.backgroundColor =
      carrierColors[serviceId] || carrierColors.default;
    carrierTile.style.color = "#fff";
    carrierTile.style.fontWeight = "bold";
    carrierTile.style.textAlign = "center";
    carrierTile.style.cursor = "pointer";
    carrierTile.style.transition = "transform 0.2s, box-shadow 0.2s";
    carrierTile.style.position = "relative";

    const carrierName = document.createElement("div");
    carrierName.textContent = name;
    carrierName.style.marginBottom = "10px";
    carrierName.style.fontSize = "16px";
    carrierTile.appendChild(carrierName);

    const priceElement = document.createElement("div");
    priceElement.classList.add("carrier-price");
    priceElement.textContent = price
      ? `${(price / 100).toFixed(2)} zł`
      : "Cena niedostępna";
    priceElement.style.fontSize = "14px";
    carrierTile.appendChild(priceElement);

    // Dodanie zdarzenia kliknięcia
    carrierTile.addEventListener("click", () => {
      document.querySelectorAll(".carrier-tile").forEach((tile) => {
        tile.style.transform = "scale(1)";
        tile.style.boxShadow = "none";
        tile.style.opacity = "0.7";
      });

      // Zaznaczamy wybrany kafelek
      carrierTile.style.transform = "scale(1.05)";
      carrierTile.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
      carrierTile.style.opacity = "1";

      // Ustawiamy service_id
      serviceIdInput.value = serviceId;

      // Sprawdzamy czy przycisk nadania paczki może być aktywowany
      checkSendReady();
    });

    return carrierTile;
  }

  // Tworzenie kafelków dla wybranych przewoźników (domyślnie nieaktywne)
  const priorityCarriers = ["21", "42"];
  priorityCarriers.forEach((serviceId) => {
    const name = carrierNames[serviceId] || `Przewoźnik ${serviceId}`;
    const tile = createCarrierTile(serviceId, name);
    tile.style.opacity = "0.7"; // Nieaktywny do czasu wyceny
    carriersGrid.appendChild(tile);
  });

  form.appendChild(carriersContainer);

  sf_fieldset_dane_dostawy.appendChild(apaczkaContainer);
})();
