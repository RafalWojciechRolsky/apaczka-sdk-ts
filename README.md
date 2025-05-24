# apaczka-sdk-ts

Aplikacja do integracji sklepu internetowego pracującym na SoteSHOP z serwisem kurierskim Apaczka (przez API)

## Opis systemu

apaczka-sdk-ts to kompletne rozwiązanie integracyjne, składające się z dwóch głównych komponentów:

1. **Serwer Node.js** - backendu napisanego w TypeScript, który komunikuje się z API serwisu Apaczka
2. **Skrypt dla przeglądarki** - frontend, który można zainstalować poprzez rozszerzenie do przeglądarki np. Tampermonkey/Greasemonkey, osadzany na stronie panelu administracyjnego sklepu

System umożliwia automatyzację procesu nadawania przesyłek bezpośrednio z panelu administracyjnego sklepu, bez konieczności ręcznego przepisywania danych klientów.

## Część serwerowa

Serwer Node.js z Express obsługuje komunikację z API Apaczka, przetwarzając i przekazując dane do serwisu kurierskiego.

### Środowisko

- **Runtime**: Node.js (rekomendowana wersja 14.x lub wyższa)
- **Język**: TypeScript (kompilowany do JavaScript)
- **System modułów**: CommonJS
- **Komunikacja API**: Wykorzystuje bibliotekę `axios` do zapytań HTTP
- **Zależności**:
  - `dotenv` do zarządzania zmiennymi środowiskowymi
  - `express` do obsługi serwera HTTP

### Konfiguracja

SDK wykorzystuje zmienne środowiskowe do konfiguracji. Wymagane są następujące zmienne:

- `APP_ID`: Identyfikator aplikacji Apaczka
- `APP_SECRET`: Klucz aplikacji Apaczka
- `API_URL`: Bazowy URL dla API Apaczka (domyślnie: https://api.apaczka.com/v1/)
- `PORT`: Port, na którym uruchomiony zostanie serwer Express

Zmienne te można ustawić w pliku `.env` w katalogu głównym projektu lub dostarczyć przez środowisko wdrożeniowe.

### Endpointy API

Serwer Express udostępnia następujące endpointy:

- `POST /api/apaczka/order-valuation`: Wycena zamówienia
- `POST /api/apaczka/order-send`: Wysłanie nowego zamówienia

### SDK dla Apaczka API

SDK dostarcza następujące metody:

- `order(id: string)`: Pobierz szczegóły konkretnego zamówienia
- `orders(page?: number, limit?: number)`: Lista zamówień
- `waybill(id: string)`: Pobierz list przewozowy dla zamówienia
- `pickupHours(postalCode: string, serviceId?: string)`: Pobierz dostępne godziny odbioru
- `orderValuation(order: OrderRequest)`: Wycena zamówienia
- `orderSend(order: OrderRequest)`: Wyślij nowe zamówienie
- `cancelOrder(id: string)`: Anuluj zamówienie
- `serviceStructure()`: Pobierz strukturę usług
- `points(type?: string)`: Pobierz punkty odbioru/dostawy
- `customerRegister(customer: Record<string, unknown>)`: Zarejestruj nowego klienta
- `turnIn(orderIds: string[])`: Zgłoś zamówienia do odbioru

## Skrypt dla przeglądarki

Skrypt frontendowy (`scriptForApaczka.js`) jest zaprojektowany do instalacji poprzez rozszerzenie Tampermonkey lub podobne. Skrypt działa na stronie edycji zamówienia w panelu administracyjnym sklepu.

### Funkcje skryptu:

1. **Automatyczne pobieranie danych** - Skrypt analizuje DOM strony zamówienia, aby pobrać dane klienta (np. imię, nazwisko, adres, email, telefon)
2. **Interfejs użytkownika** - Dodaje formularz do strony zamówienia, wypełniony automatycznie pobranymi danymi
3. **Wycena przesyłki** - Umożliwia wycenę przesyłki przed jej nadaniem
4. **Wysyłanie zamówienia** - Przesyła dane do serwera, który komunikuje się z API Apaczka

### Ważne ograniczenia:

- **Limit znaków dla DPD** - API DPD (service_id: 21) ma ścisły limit 49 znaków dla zawartości przesyłki. Pole "Zawartość przesyłki" w formularzu wyświetla licznik znaków, ograniczając długość tekstu do 49 znaków, aby zapobiec błędom API.

### Integracja:

Skrypt komunikuje się z backendem poprzez wysyłanie żądania POST do endpointu `/api/apaczka/order-send` z danymi przesyłki.

## Dokumentacja API i wytyczne:

- [Dokumentacja API](https://panel.apaczka.pl/dokumentacja_api_v2.php)
- [Wytyczne dla klientów API](https://www.apaczka.pl/app/uploads/2022/12/Zalecenia-dla-klientow-API.pdf)

## Uruchomienie projektu

Aby skonfigurować projekt do rozwoju:

1. Sklonuj repozytorium
2. Zainstaluj zależności: `npm install`
3. Zbuduj projekt: `npm run build`
4. Uruchom projekt: `npm start`

## Instalacja skryptu dla przeglądarki

1. Zainstaluj rozszerzenie Tampermonkey w przeglądarce
2. Utwórz nowy skrypt i skopiuj zawartość pliku `frontScript/scriptForApaczka.js`
3. Zapisz skrypt i aktywuj go
4. Przejdź do panelu administracyjnego sklepu, na stronę edycji zamówienia

## Autor

Rafał Majewski
