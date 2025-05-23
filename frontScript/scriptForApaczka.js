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
  form.style.borderRadius = "8px";
  form.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";

  // Tworzymy kontener flex dla dwóch kolumn
  const formColumnsContainer = document.createElement("div");
  formColumnsContainer.style.display = "flex";
  formColumnsContainer.style.flexWrap = "wrap";
  formColumnsContainer.style.gap = "20px";
  formColumnsContainer.style.justifyContent = "space-between";
  form.appendChild(formColumnsContainer);

  // Lewa kolumna
  const leftColumn = document.createElement("div");
  leftColumn.style.flex = "1";
  leftColumn.style.minWidth = "300px";
  formColumnsContainer.appendChild(leftColumn);

  // Prawa kolumna
  const rightColumn = document.createElement("div");
  rightColumn.style.flex = "1";
  rightColumn.style.minWidth = "300px";
  formColumnsContainer.appendChild(rightColumn);

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
    labelElement.style.fontWeight = "500";
    labelElement.style.color = "#444";

    const input = document.createElement("input");
    input.type = type;
    input.id = name;
    input.name = name;
    input.value = value;
    input.style.flexGrow = "1";
    input.style.padding = "8px 12px";
    input.style.border = "1px solid #ced4da";
    input.style.borderRadius = "4px";
    input.style.transition =
      "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out";
    input.style.fontSize = "14px";
    input.style.boxSizing = "border-box";
    input.style.width = "100%";

    // Dodajemy stany hover i focus
    input.addEventListener("focus", () => {
      input.style.outline = "none";
      input.style.borderColor = "#80bdff";
      input.style.boxShadow = "0 0 0 3px rgba(0,123,255,0.25)";
    });

    input.addEventListener("blur", () => {
      input.style.boxShadow = "none";
      input.style.borderColor = "#ced4da";
    });

    div.appendChild(labelElement);
    div.appendChild(input);

    return div;
  }

  // Funkcja pomocnicza do dodawania pól do określonej kolumny
  function addFieldToColumn(column, field) {
    column.appendChild(field);
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
  apaczkaContainer.style.marginTop = "25px";
  apaczkaContainer.style.padding = "15px";
  apaczkaContainer.style.border = "1px solid #e0e0e0";
  apaczkaContainer.style.borderRadius = "8px";
  apaczkaContainer.style.backgroundColor = "#fff";
  apaczkaContainer.style.boxShadow = "0 3px 10px rgba(0,0,0,0.08)";

  const apaczkaTitle = document.createElement("h3");
  apaczkaTitle.textContent = "Wyślij paczkę przez Apaczka";
  apaczkaTitle.style.margin = "0 0 15px 0";
  apaczkaTitle.style.padding = "10px 0";
  apaczkaTitle.style.borderBottom = "2px solid #f0f0f0";
  apaczkaTitle.style.fontSize = "18px";
  apaczkaTitle.style.fontWeight = "bold";
  apaczkaTitle.style.color = "#333";
  apaczkaTitle.style.display = "flex";
  apaczkaTitle.style.alignItems = "center";

  // Dodajemy ikonę (opcjonalnie)
  const titleIcon = document.createElement("span");
  titleIcon.innerHTML = "📦";
  titleIcon.style.marginRight = "8px";
  titleIcon.style.fontSize = "20px";
  apaczkaTitle.prepend(titleIcon);

  apaczkaContainer.appendChild(apaczkaTitle);
  apaczkaContainer.appendChild(form);

  // Dodajemy pola z domyślnymi wartościami, ale możliwe do edycji - rozmieszczamy w dwóch kolumnach
  const nameField = createFormField(
    "Nazwa firmy / Imię i nazwisko",
    "text",
    "name",
    customerName
  );
  addFieldToColumn(leftColumn, nameField);
  addFieldToColumn(
    leftColumn,
    createFormField("Email", "email", "email", customerEmail)
  );
  addFieldToColumn(
    leftColumn,
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

    // Dodajemy pola do odpowiednich kolumn, równomiernie rozkładając
    addFieldToColumn(
      leftColumn,
      createFormField("Ulica", "text", "street", streetName)
    );
    addFieldToColumn(
      leftColumn,
      createFormField("Numer budynku", "text", "buildingNumber", buildingNumber)
    );
    addFieldToColumn(
      leftColumn,
      createFormField(
        "Numer lokalu",
        "text",
        "apartmentNumber",
        apartmentNumber
      )
    );
    addFieldToColumn(
      leftColumn,
      createFormField("Kod pocztowy", "text", "postalCode", postalCode)
    );

    addFieldToColumn(
      rightColumn,
      createFormField("Miasto", "text", "city", city)
    );
    addFieldToColumn(
      rightColumn,
      createFormField("Województwo", "text", "province", province)
    );
    addFieldToColumn(
      rightColumn,
      createFormField("Kraj", "text", "country", country)
    );
    addFieldToColumn(
      rightColumn,
      createFormField("Telefon", "text", "phone", phone)
    );
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

  // Oryginalna zawartość przesyłki
  const fullContent = `Zamówienie ${orderId} ${mostExpensiveProductName}`;

  // Skrócona wersja do 50 znaków (dla DPD)
  const defaultContent = fullContent.substring(0, 50);

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
  // Tworzymy pola z ograniczeniami wymiarów i wagi
  // Pola wymiarów i wagi - dodajemy do prawej kolumny
  const dimension1Field = createFormField(
    "Długość (cm)",
    "number",
    "dimension1",
    "10"
  );
  const dimension1Input = dimension1Field.querySelector("input");
  dimension1Input.min = "1";
  dimension1Input.max = "150";
  dimension1Input.step = "1";
  dimension1Input.setAttribute("title", "Maksymalna długość: 150 cm");

  // Dodajemy etykietę z informacją o maksymalnym wymiarze
  const dimension1Hint = document.createElement("div");
  // dimension1Hint.textContent = "Max: 150 cm";
  dimension1Hint.style.fontSize = "11px";
  dimension1Hint.style.color = "#6c757d";
  dimension1Hint.style.marginTop = "2px";
  dimension1Field.appendChild(dimension1Hint);

  addFieldToColumn(rightColumn, dimension1Field);

  const dimension2Field = createFormField(
    "Szerokość (cm)",
    "number",
    "dimension2",
    "10"
  );
  const dimension2Input = dimension2Field.querySelector("input");
  dimension2Input.min = "1";
  dimension2Input.max = "150";
  dimension2Input.step = "1";
  dimension2Input.setAttribute("title", "Maksymalna szerokość: 150 cm");

  const dimension2Hint = document.createElement("div");
  // dimension2Hint.textContent = "Max: 150 cm";
  dimension2Hint.style.fontSize = "11px";
  dimension2Hint.style.color = "#6c757d";
  dimension2Hint.style.marginTop = "2px";
  dimension2Field.appendChild(dimension2Hint);

  addFieldToColumn(rightColumn, dimension2Field);

  const dimension3Field = createFormField(
    "Wysokość (cm)",
    "number",
    "dimension3",
    "10"
  );
  const dimension3Input = dimension3Field.querySelector("input");
  dimension3Input.min = "1";
  dimension3Input.max = "150";
  dimension3Input.step = "1";
  dimension3Input.setAttribute("title", "Maksymalna wysokość: 150 cm");

  const dimension3Hint = document.createElement("div");
  // dimension3Hint.textContent = "Max: 150 cm";
  dimension3Hint.style.fontSize = "11px";
  dimension3Hint.style.color = "#6c757d";
  dimension3Hint.style.marginTop = "2px";
  dimension3Field.appendChild(dimension3Hint);

  addFieldToColumn(rightColumn, dimension3Field);

  const weightField = createFormField("Waga (kg)", "number", "weight", "1");
  const weightInput = weightField.querySelector("input");
  weightInput.min = "0.1";
  weightInput.max = "35";
  weightInput.step = "0.1";
  weightInput.setAttribute("title", "Maksymalna waga: 35 kg");

  const weightHint = document.createElement("div");
  // weightHint.textContent = "Max: 35 kg";
  weightHint.style.fontSize = "11px";
  weightHint.style.color = "#6c757d";
  weightHint.style.marginTop = "2px";
  weightField.appendChild(weightHint);

  addFieldToColumn(rightColumn, weightField);

  // Deklarowana wartość i pobranie - dodajemy do lewej kolumny pod adresem
  addFieldToColumn(
    leftColumn,
    createFormField(
      "Deklarowana wartość (PLN)",
      "number",
      "shipment_value",
      declaredValue.toString()
    )
  );

  // Kwota pobrania (opcjonalnie)
  addFieldToColumn(
    leftColumn,
    createFormField(
      "Kwota pobrania (PLN) – zostaw 0 jeżeli brak",
      "number",
      "cod_amount",
      "0"
    )
  );

  // Dodajemy pole na zawartość przesyłki z limitem 50 znaków - dodajemy do prawej kolumny
  const contentField = createFormField(
    "Zawartość przesyłki",
    "text",
    "content",
    defaultContent.substring(0, 50)
  );
  addFieldToColumn(rightColumn, contentField);

  // Ustawiamy limit znaków dla pola content
  const contentInput = form.querySelector("input[name='content']");
  contentInput.maxLength = 50;

  // Ukryte pole na service_id (wypełnione po wycenie)
  const serviceIdInput = document.createElement("input");
  serviceIdInput.type = "hidden";
  serviceIdInput.id = "service_id";
  serviceIdInput.name = "service_id";
  form.appendChild(serviceIdInput);

  // Dodajemy nasłuchiwanie zmian w polach wymiarów i wagi
  ["dimension1", "dimension2", "dimension3", "weight"].forEach((id) => {
    const input = form.querySelector(`#${id}`);
    input.addEventListener("change", checkSendReady);
    input.addEventListener("input", checkSendReady);
  });

  // Kontener pod przyciski - umieszczamy pod polem zawartości
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.marginTop = "20px";
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.gap = "15px";
  buttonsContainer.style.justifyContent = "flex-start";
  buttonsContainer.style.alignItems = "center";
  form.appendChild(buttonsContainer);

  /* ------------------- PRZYCISK 1 – WYCENA ------------------- */
  const quoteButton = document.createElement("button");
  quoteButton.textContent = "Wycena";
  quoteButton.style.padding = "10px 20px";
  quoteButton.style.backgroundColor = "#28a745";
  quoteButton.style.color = "white";
  quoteButton.style.border = "none";
  quoteButton.style.borderRadius = "5px";
  quoteButton.style.cursor = "pointer";
  quoteButton.style.fontWeight = "600";
  quoteButton.style.fontSize = "14px";
  quoteButton.style.transition = "all 0.2s ease";
  quoteButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  quoteButton.style.position = "relative";
  quoteButton.style.overflow = "hidden";
  quoteButton.style.minWidth = "120px";
  // Domyślnie przycisk jest aktywny
  quoteButton.disabled = false;

  // Dodajemy efekt hover (gdy przycisk nie jest wyłączony)
  quoteButton.addEventListener("mouseenter", () => {
    if (!quoteButton.disabled) {
      quoteButton.style.backgroundColor = "#218838"; // Ciemniejszy zielony
      quoteButton.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      quoteButton.style.transform = "translateY(-1px)";
    }
  });

  quoteButton.addEventListener("mouseleave", () => {
    if (!quoteButton.disabled) {
      quoteButton.style.backgroundColor = "#28a745"; // Powrót do oryginalnego zielonego koloru
      quoteButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      quoteButton.style.transform = "translateY(0)";
    }
  });

  // Dodajemy efekt aktywnego przycisku
  quoteButton.addEventListener("mousedown", () => {
    if (!quoteButton.disabled) {
      quoteButton.style.transform = "translateY(1px)";
      quoteButton.style.boxShadow = "0 1px 2px rgba(0,0,0,0.2)";
    }
  });

  quoteButton.addEventListener("mouseup", () => {
    if (!quoteButton.disabled) {
      quoteButton.style.transform = "translateY(-1px)";
      quoteButton.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    }
  });

  // Funkcja sprawdzająca czy wartości wymiarów i wagi spełniają ograniczenia
  function checkQuoteReady() {
    // Sprawdzamy tylko pola dotyczące wymiarów i wagi - nie blokujemy przycisku wyceny gdy inne pola są puste
    const d1 = form.querySelector("#dimension1").value;
    const d2 = form.querySelector("#dimension2").value;
    const d3 = form.querySelector("#dimension3").value;
    const w = form.querySelector("#weight").value;

    // Sprawdzamy czy wymiary i waga mieszczą się w dopuszczalnych granicach
    const dimensionsValid =
      parseFloat(d1) > 0 &&
      parseFloat(d1) <= 150 &&
      parseFloat(d2) > 0 &&
      parseFloat(d2) <= 150 &&
      parseFloat(d3) > 0 &&
      parseFloat(d3) <= 150;

    const weightValid = parseFloat(w) > 0 && parseFloat(w) <= 35;

    // Resetujemy style pól
    ["dimension1", "dimension2", "dimension3", "weight"].forEach((id) => {
      const input = form.querySelector(`#${id}`);
      input.style.borderColor = "#ced4da";
    });

    // Jeśli są nieprawidłowe wartości, podświetlamy je na czerwono
    if (!dimensionsValid) {
      if (parseFloat(d1) <= 0 || parseFloat(d1) > 150) {
        form.querySelector("#dimension1").style.borderColor = "#dc3545";
      }
      if (parseFloat(d2) <= 0 || parseFloat(d2) > 150) {
        form.querySelector("#dimension2").style.borderColor = "#dc3545";
      }
      if (parseFloat(d3) <= 0 || parseFloat(d3) > 150) {
        form.querySelector("#dimension3").style.borderColor = "#dc3545";
      }
    }

    if (!weightValid) {
      form.querySelector("#weight").style.borderColor = "#dc3545";
    }

    // Przycisk jest nieaktywny tylko gdy wartości są nieprawidłowe, ale nie gdy pola są puste
    const hasValues = d1 || d2 || d3 || w;

    // Jeśli którekolwiek pole wymiarów lub wagi ma wartość, sprawdzamy walidację
    if (hasValues) {
      quoteButton.disabled = !(dimensionsValid && weightValid);
    } else {
      // Jeśli pola są puste, przycisk jest aktywny
      quoteButton.disabled = false;
    }

    // Aktualizujemy styl przycisku
    if (quoteButton.disabled) {
      quoteButton.style.backgroundColor = "#6c757d";
      quoteButton.style.cursor = "not-allowed";

      // Sprawdzamy czy błąd dotyczy przekroczenia limitów
      if (d1 && d2 && d3 && w && (!dimensionsValid || !weightValid)) {
        quoteButton.title =
          "Wymiary muszą być w zakresie 1-150 cm, a waga 0.1-35 kg";
      } else {
        quoteButton.title = "Wypełnij wszystkie wymagane pola";
      }
    } else {
      quoteButton.style.backgroundColor = "#28a745"; // Zielony kolor dla aktywnego przycisku
      quoteButton.style.cursor = "pointer";
      quoteButton.title = "";
    }
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

            // Usuwamy wskaźnik oczekiwania
            const waitingElements = tile.querySelectorAll("div");
            for (let elem of waitingElements) {
              if (elem.textContent === "Oczekiwanie na wycenę...") {
                tile.removeChild(elem);
                break;
              }
            }
          } else {
            const priceElement = tile.querySelector(".carrier-price");
            priceElement.textContent = "Niedostępny";
            priceElement.style.backgroundColor = "rgba(0,0,0,0.1)";
            tile.style.opacity = "0.5";
            tile.style.cursor = "not-allowed";
            tile.style.filter = "grayscale(80%)";

            // Usuwamy wskaźnik oczekiwania
            const waitingElements = tile.querySelectorAll("div");
            for (let elem of waitingElements) {
              if (elem.textContent === "Oczekiwanie na wycenę...") {
                tile.removeChild(elem);
                break;
              }
            }

            // Dodajemy informację o niedostępności
            const unavailableInfo = document.createElement("div");
            unavailableInfo.textContent = "Przewoźnik niedostępny";
            unavailableInfo.style.fontSize = "12px";
            unavailableInfo.style.fontStyle = "italic";
            unavailableInfo.style.marginTop = "5px";
            unavailableInfo.style.opacity = "0.8";
            tile.appendChild(unavailableInfo);
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
  button.style.padding = "10px 20px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.transition = "all 0.2s ease";
  button.style.fontWeight = "600";
  button.style.fontSize = "14px";
  button.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.style.minWidth = "200px";
  button.style.whiteSpace = "nowrap";

  // Dodajemy efekt hover (gdy przycisk nie jest wyłączony)
  button.addEventListener("mouseenter", () => {
    if (!button.disabled) {
      button.style.backgroundColor = "#0069d9";
      button.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      button.style.transform = "translateY(-1px)";
    }
  });

  button.addEventListener("mouseleave", () => {
    if (!button.disabled) {
      button.style.backgroundColor = "#007bff";
      button.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      button.style.transform = "translateY(0)";
    }
  });

  // Dodajemy efekt aktywnego przycisku
  button.addEventListener("mousedown", () => {
    if (!button.disabled) {
      button.style.transform = "translateY(1px)";
      button.style.boxShadow = "0 1px 2px rgba(0,0,0,0.2)";
    }
  });

  button.addEventListener("mouseup", () => {
    if (!button.disabled) {
      button.style.transform = "translateY(-1px)";
      button.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    }
  });

  // przycisk aktywny po wycenie (gdy ustawiono service_id) i gdy wymiary i waga są prawidłowe
  function checkSendReady() {
    // Sprawdzamy czy przycisk nie jest już zablokowany z powodu trwającej operacji
    if (button.textContent === "Trwa nadawanie paczki...") {
      return; // Jeśli operacja w toku, nie zmieniamy stanu przycisku
    }

    // Sprawdzamy czy wymiary i waga są prawidłowe
    const d1 = parseFloat(form.querySelector("#dimension1").value);
    const d2 = parseFloat(form.querySelector("#dimension2").value);
    const d3 = parseFloat(form.querySelector("#dimension3").value);
    const w = parseFloat(form.querySelector("#weight").value);

    const dimensionsValid =
      d1 > 0 && d1 <= 150 && d2 > 0 && d2 <= 150 && d3 > 0 && d3 <= 150;

    const weightValid = w > 0 && w <= 35;

    // Sprawdzamy czy service_id jest ustawione (wycena została wykonana)
    const serviceIdValid = serviceIdInput.value !== "";

    // Komunikat o błędach, jeśli istnieje - usuwamy go
    const existingErrorMsg = document.getElementById("dimensions-error-msg");
    if (existingErrorMsg) {
      form.removeChild(existingErrorMsg);
    }

    // Resetujemy style pól
    ["dimension1", "dimension2", "dimension3", "weight"].forEach((id) => {
      const input = form.querySelector(`#${id}`);
      input.style.borderColor = "#ced4da";
    });

    // Jeśli wymiary lub waga przekraczają limity, wyświetlamy komunikat i blokujemy przycisk
    if (!dimensionsValid || !weightValid) {
      // Podświetlamy nieprawidłowe pola
      if (!dimensionsValid) {
        if (d1 <= 0 || d1 > 150) {
          form.querySelector("#dimension1").style.borderColor = "#dc3545";
        }
        if (d2 <= 0 || d2 > 150) {
          form.querySelector("#dimension2").style.borderColor = "#dc3545";
        }
        if (d3 <= 0 || d3 > 150) {
          form.querySelector("#dimension3").style.borderColor = "#dc3545";
        }
      }
      if (!weightValid) {
        form.querySelector("#weight").style.borderColor = "#dc3545";
      }

      // Dodajemy komunikat o błędzie
      const errorMsg = document.createElement("div");
      errorMsg.id = "dimensions-error-msg";
      errorMsg.innerHTML = `
        <div style="display: flex; align-items: center; margin-top: 15px; padding: 10px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
          <div style="margin-right: 10px; font-size: 20px;">⚠</div>
          <div>
            <div style="font-weight: bold; color: #721c24;">Wymiary lub waga przekraczają dopuszczalne limity</div>
            <div style="font-size: 12px; color: #555;">Wymiary muszą być w zakresie 1-150 cm, a waga 0.1-35 kg.</div>
          </div>
        </div>
      `;
      form.appendChild(errorMsg);
    }

    // Przycisk jest aktywny tylko gdy service_id jest ustawione i wymiary/waga są prawidłowe
    button.disabled = !serviceIdValid || !dimensionsValid || !weightValid;

    // Aktualizujemy styl przycisku
    button.style.backgroundColor = button.disabled ? "#6c757d" : "#007bff";
    button.style.opacity = button.disabled ? "0.7" : "1";
    button.style.cursor = button.disabled ? "not-allowed" : "pointer";

    // Ustawiamy tooltip z informacją, dlaczego przycisk jest nieaktywny
    if (button.disabled) {
      if (!serviceIdValid) {
        button.title = "Najpierw wykonaj wycenę i wybierz przewoźnika";
      } else if (!dimensionsValid || !weightValid) {
        button.title =
          "Wymiary muszą być w zakresie 1-150 cm, a waga 0.1-35 kg";
      }
    } else {
      button.title = "";
    }
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

    // Sprawdzamy jeszcze raz wymiary i wagę przed wysyłką
    const d1 = parseFloat(form.querySelector("#dimension1").value);
    const d2 = parseFloat(form.querySelector("#dimension2").value);
    const d3 = parseFloat(form.querySelector("#dimension3").value);
    const w = parseFloat(form.querySelector("#weight").value);

    const dimensionsValid =
      d1 > 0 && d1 <= 150 && d2 > 0 && d2 <= 150 && d3 > 0 && d3 <= 150;

    const weightValid = w > 0 && w <= 35;

    if (!dimensionsValid || !weightValid) {
      // Wykonujemy checkSendReady() aby podświetlić błędne pola i wyświetlić komunikat
      checkSendReady();
      return;
    }

    // Blokujemy przycisk podczas wysyłki
    button.disabled = true;
    button.style.backgroundColor = "#6c757d";
    button.style.opacity = "0.7";
    button.style.cursor = "not-allowed";
    button.textContent = "Trwa nadawanie paczki...";

    // Tworzymy i wyświetlamy komunikat o trwającej wysyłce
    const loadingMsg = document.createElement("div");
    loadingMsg.id = "apaczka-loading-message";
    loadingMsg.innerHTML = `
      <div style="display: flex; align-items: center; margin-top: 15px; padding: 10px; background-color: #e8f4ff; border-radius: 5px; border-left: 4px solid #007bff;">
        <div style="margin-right: 10px; animation: spin 2s linear infinite;">⟳</div>
        <div>
          <div style="font-weight: bold; color: #0056b3;">Trwa nadawanie paczki...</div>
          <div style="font-size: 12px; color: #555;">Proszę czekać, operacja może potrwać kilka sekund.</div>
        </div>
      </div>
    `;

    // Dodajemy styl animacji
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleElement);

    // Dodajemy komunikat do formularza
    form.appendChild(loadingMsg);

    console.log("Wysyłam dane do /api/apaczka/order-send", orderData);

    tmPost("/api/apaczka/order-send", orderData)
      .then((data) => {
        console.log("Odpowiedź API:", data);

        // Usuwamy komunikat o ładowaniu
        if (loadingMsg && loadingMsg.parentNode) {
          form.removeChild(loadingMsg);
        }

        // Sprawdzamy status odpowiedzi
        if (data.status !== 200) {
          // W przypadku błędu wyświetlamy komunikat o błędzie
          const errorMsg = document.createElement("div");
          errorMsg.innerHTML = `
            <div style="display: flex; align-items: center; margin-top: 15px; padding: 10px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
              <div style="margin-right: 10px; font-size: 20px;">⚠</div>
              <div>
                <div style="font-weight: bold; color: #721c24;">Wystąpił błąd podczas nadawania paczki</div>
                <div style="font-size: 12px; color: #555;">${
                  data.message || "Nieznany błąd"
                }</div>
                ${
                  data.response?.errors?.length
                    ? `<div style="font-size: 12px; color: #555; margin-top: 5px;">Szczegóły: ${data.response.errors.join(
                        ", "
                      )}</div>`
                    : ""
                }
              </div>
            </div>
          `;
          form.appendChild(errorMsg);

          // Odblokowanie przycisku
          setTimeout(() => {
            button.disabled = false;
            button.style.cursor = "pointer";
            checkSendReady();
            button.textContent = "Nadaj paczkę w Apaczka";
          }, 3000);

          // Usuwamy komunikat o błędzie po pewnym czasie
          setTimeout(() => {
            if (errorMsg && errorMsg.parentNode) {
              form.removeChild(errorMsg);
            }
          }, 8000);

          return; // Przerywamy dalsze przetwarzanie
        }

        // Jeśli status to 200, wyświetlamy komunikat o sukcesie
        const successMsg = document.createElement("div");
        successMsg.innerHTML = `
          <div style="display: flex; align-items: center; margin-top: 15px; padding: 10px; background-color: #d4edda; border-radius: 5px; border-left: 4px solid #28a745;">
            <div style="margin-right: 10px; font-size: 20px;">✔</div>
            <div>
              <div style="font-weight: bold; color: #155724;">Paczka została pomyślnie nadana!</div>
              <div style="font-size: 12px; color: #555;">Numer listu przewozowego: ${
                data.response?.order?.waybill_number || "N/A"
              }</div>
              <div style="font-size: 12px; color: #555;">ID zamówienia: ${
                data.response?.order?.id || "N/A"
              }</div>
            </div>
          </div>
        `;
        form.appendChild(successMsg);

        // Odblokowanie przycisku po 5 sekundach
        setTimeout(() => {
          button.disabled = false;
          button.style.cursor = "pointer";
          checkSendReady(); // Przywracamy pierwotny stan przycisku
          button.textContent = "Nadaj paczkę w Apaczka";
        }, 5000);

        // Usuwamy komunikat sukcesu po dłuższym czasie
        setTimeout(() => {
          if (successMsg && successMsg.parentNode) {
            form.removeChild(successMsg);
          }
        }, 10000);
      })
      .catch((error) => {
        console.error("Błąd podczas nadawania paczki:", error);

        // Usuwamy komunikat o ładowaniu
        if (loadingMsg && loadingMsg.parentNode) {
          form.removeChild(loadingMsg);
        }

        // Wyświetlamy komunikat o błędzie
        const errorMsg = document.createElement("div");
        errorMsg.innerHTML = `
          <div style="display: flex; align-items: center; margin-top: 15px; padding: 10px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
            <div style="margin-right: 10px; font-size: 20px;">⚠</div>
            <div>
              <div style="font-weight: bold; color: #721c24;">Wystąpił błąd podczas nadawania paczki</div>
              <div style="font-size: 12px; color: #555;">${
                error.message || "Nieznany błąd"
              }</div>
            </div>
          </div>
        `;
        form.appendChild(errorMsg);

        // Odblokowanie przycisku
        setTimeout(() => {
          button.disabled = false;
          button.style.cursor = "pointer";
          checkSendReady(); // Przywracamy pierwotny stan przycisku
          button.textContent = "Nadaj paczkę w Apaczka";
        }, 3000);

        // Usuwamy komunikat o błędzie po pewnym czasie
        setTimeout(() => {
          if (errorMsg && errorMsg.parentNode) {
            form.removeChild(errorMsg);
          }
        }, 8000);
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

    // Determine content based on service_id, with a 49-char limit for DPD
    let apiContent;
    const currentDefaultContent =
      typeof defaultContent === "string" ? defaultContent : "";
    const currentFullContent =
      typeof fullContent === "string" ? fullContent : "";

    if (String(data.service_id) === "21") {
      // DPD service_id
      apiContent = currentDefaultContent.substring(0, 49);
    } else {
      // For other services like InPost
      apiContent = currentFullContent;
    }

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
          dimension1: Math.min(Math.max(1, data.dimension1 || 10), 150),
          dimension2: Math.min(Math.max(1, data.dimension2 || 10), 150),
          dimension3: Math.min(Math.max(1, data.dimension3 || 10), 150),
          shipment_type_code: "PACZKA",
          weight: Math.min(Math.max(0.1, data.weight || 1), 35),
          is_nstd: 0,
        },
      ],
      comment: data.comment || "",
      content: apiContent,
    };

    // Logowanie danych przed wysłaniem
    console.log("Dane wysyłane do API (buildOrderData):");
    console.log(
      "Service ID:",
      orderRequest.service_id,
      "(Typ: ",
      typeof orderRequest.service_id,
      ")"
    );
    console.log(
      "Content:",
      orderRequest.content,
      "(Długość: ",
      (orderRequest.content || "").length,
      ")"
    );
    console.log(
      "Pełny obiekt orderRequest:",
      JSON.stringify(orderRequest, null, 2)
    );

    return orderRequest;
  }

  // Kontener na kafelki przewoźników
  const carriersContainer = document.createElement("div");
  carriersContainer.style.marginTop = "25px";
  carriersContainer.style.marginBottom = "20px";
  carriersContainer.style.padding = "15px";
  carriersContainer.style.backgroundColor = "#f8f9fa";
  carriersContainer.style.borderRadius = "8px";
  carriersContainer.style.border = "1px solid #e9ecef";

  const carriersTitle = document.createElement("h4");
  carriersTitle.textContent = "Dostępni przewoźnicy";
  carriersTitle.style.margin = "0 0 15px 0";
  carriersTitle.style.color = "#333";
  carriersTitle.style.fontSize = "16px";
  carriersTitle.style.fontWeight = "600";
  carriersTitle.style.display = "flex";
  carriersTitle.style.alignItems = "center";

  // Dodajemy ikonę do tytułu
  const carrierIcon = document.createElement("span");
  carrierIcon.innerHTML = "🚚";
  carrierIcon.style.marginRight = "8px";
  carrierIcon.style.fontSize = "18px";
  carriersTitle.prepend(carrierIcon);

  carriersContainer.appendChild(carriersTitle);

  const carriersGrid = document.createElement("div");
  carriersGrid.style.display = "grid";
  carriersGrid.style.gridTemplateColumns =
    "repeat(auto-fill, minmax(220px, 1fr))";
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
    carrierTile.style.border = "1px solid rgba(0,0,0,0.1)";
    carrierTile.style.borderRadius = "8px";
    carrierTile.style.padding = "18px";
    carrierTile.style.backgroundColor =
      carrierColors[serviceId] || carrierColors.default;
    carrierTile.style.color = "#fff";
    carrierTile.style.fontWeight = "bold";
    carrierTile.style.textAlign = "center";
    carrierTile.style.cursor = "pointer";
    carrierTile.style.transition = "all 0.25s ease";
    carrierTile.style.position = "relative";
    carrierTile.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    carrierTile.style.display = "flex";
    carrierTile.style.flexDirection = "column";
    carrierTile.style.justifyContent = "space-between";
    carrierTile.style.height = "130px";

    // Logo/Nazwa przewoźnika
    const carrierName = document.createElement("div");
    carrierName.textContent = name;
    carrierName.style.marginBottom = "10px";
    carrierName.style.fontSize = "18px";
    carrierName.style.letterSpacing = "0.5px";
    carrierName.style.textShadow = "0 1px 2px rgba(0,0,0,0.2)";
    carrierTile.appendChild(carrierName);

    // Cena
    const priceElement = document.createElement("div");
    priceElement.classList.add("carrier-price");
    priceElement.textContent = price
      ? `${(price / 100).toFixed(2)} zł`
      : "Cena niedostępna";
    priceElement.style.fontSize = "16px";
    priceElement.style.fontWeight = "600";
    priceElement.style.backgroundColor = "rgba(255,255,255,0.2)";
    priceElement.style.padding = "6px 8px";
    priceElement.style.borderRadius = "4px";
    priceElement.style.margin = "5px 0";
    carrierTile.appendChild(priceElement);

    // Dodajemy "Wybierz" lub podobny tekst
    const selectText = document.createElement("div");
    selectText.textContent = "Kliknij, aby wybrać";
    selectText.style.fontSize = "12px";
    selectText.style.fontWeight = "normal";
    selectText.style.opacity = "0.8";
    selectText.style.marginTop = "5px";
    carrierTile.appendChild(selectText);

    // Dodanie efektów hover
    carrierTile.addEventListener("mouseenter", () => {
      if (carrierTile.style.opacity !== "0.5") {
        // Sprawdza czy kafelek nie jest nieaktywny
        carrierTile.style.transform = "translateY(-3px)";
        carrierTile.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
      }
    });

    carrierTile.addEventListener("mouseleave", () => {
      if (carrierTile.style.opacity !== "0.5") {
        carrierTile.style.transform = "translateY(0)";
        carrierTile.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
      }
    });

    // Dodanie zdarzenia kliknięcia
    carrierTile.addEventListener("click", () => {
      if (carrierTile.style.opacity === "0.5") return; // Ignoruj kliknięcie na nieaktywne kafelki

      document.querySelectorAll(".carrier-tile").forEach((tile) => {
        tile.style.transform = "translateY(0)";
        tile.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
        tile.style.opacity = "0.7";
        // Usuwamy wskaźnik wybranego kafelka
        if (tile.querySelector(".selected-indicator")) {
          tile.removeChild(tile.querySelector(".selected-indicator"));
        }
      });

      // Zaznaczamy wybrany kafelek
      carrierTile.style.transform = "translateY(-3px)";
      carrierTile.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.25)";
      carrierTile.style.opacity = "1";

      // Dodajemy wskaźnik wybranego kafelka (znacznik wyboru)
      const selectedIndicator = document.createElement("div");
      selectedIndicator.className = "selected-indicator";
      selectedIndicator.textContent = "✓";
      selectedIndicator.style.position = "absolute";
      selectedIndicator.style.top = "5px";
      selectedIndicator.style.right = "10px";
      selectedIndicator.style.fontSize = "20px";
      selectedIndicator.style.fontWeight = "bold";
      carrierTile.appendChild(selectedIndicator);

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

    // Dodajemy wskaźnik oczekiwania na wycenę
    const waitingInfo = document.createElement("div");
    waitingInfo.textContent = "Oczekiwanie na wycenę...";
    waitingInfo.style.fontSize = "12px";
    waitingInfo.style.fontStyle = "italic";
    waitingInfo.style.marginTop = "5px";
    waitingInfo.style.opacity = "0.8";
    tile.appendChild(waitingInfo);

    carriersGrid.appendChild(tile);
  });

  // Dodajemy kontener przewoźników pod formularzem (poza kolumnami)
  form.appendChild(carriersContainer);

  // Znajdź element sf_fieldset_zawartosc, aby móc umieścić formularz przed nim
  const sf_fieldset_zawartosc = document.querySelector(
    "#sf_fieldset_zawartosc"
  );

  if (sf_fieldset_zawartosc && sf_fieldset_zawartosc.parentNode) {
    // Wstawiamy formularz przed sekcją zawartości
    sf_fieldset_zawartosc.parentNode.insertBefore(
      apaczkaContainer,
      sf_fieldset_zawartosc
    );
  } else {
    // Jeśli nie znaleziono sekcji zawartości, dodajemy do sekcji dostawy (zachowanie awaryjne)
    sf_fieldset_dane_dostawy.appendChild(apaczkaContainer);
  }
})();
