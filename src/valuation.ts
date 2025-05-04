import createApaczkaSDK from "./apaczkaApp/apaczka-sdk";
import { exampleOrderRequest } from "./config/exampleOrderRequest";
import { APP_ID, APP_SECRET } from "./config/envs";
import { ApiError, OrderRequest } from "./config/types";

/**
 * Interfejs dostosowany do faktycznej odpowiedzi z API wyceny
 */
interface ValuationResponse {
  status: number;
  message: string;
  response: {
    price_table: {
      [serviceId: string]: {
        price: string | number;
        price_gross: string | number;
      };
    };
  };
}

/**
 * Testowa funkcja do sprawdzania wyceny przesyłki z użyciem API Apaczka
 */
const main = async () => {
  if (!APP_ID || !APP_SECRET) {
    console.error("Błąd: Brak APP_ID lub APP_SECRET w zmiennych środowiskowych");
    return;
  }

  console.log("Testuję wycenę przesyłki przez API Apaczka...");
  
  try {
    // Inicjalizacja SDK
    const sdk = createApaczkaSDK(APP_ID, APP_SECRET);
    
    // Przygotowanie danych do wyceny (usuwamy service_id, bo przy wycenie nie jest potrzebne)
    const orderRequest: OrderRequest = { ...exampleOrderRequest };
    delete orderRequest.service_id;
    
    console.log("Wysyłam zapytanie o wycenę dla następujących danych:");
    console.log(JSON.stringify(orderRequest, null, 2));
    
    // Wywołanie API wyceny
    const valuation = await sdk.orderValuation(orderRequest) as unknown as ValuationResponse;
    
    console.log("\nOtrzymana wycena:");
    console.log(JSON.stringify(valuation, null, 2));
    
    // Jeśli mamy tabelę z cenami, wyświetlmy ją w czytelny sposób
    if (valuation.response && valuation.response.price_table) {
      console.log("\nDostępne opcje wysyłki:");
      
      Object.entries(valuation.response.price_table).forEach(([serviceId, priceData]) => {
        console.log(`- ID usługi: ${serviceId}, cena: ${priceData.price} PLN (brutto: ${priceData.price_gross} PLN)`);
      });
      
      // Sprawdzenie dostępności usług DPD (42) i InPost (21)
      const dpd = valuation.response.price_table["42"];
      const inpost = valuation.response.price_table["21"];
      
      console.log("\nDostępność konkretnych przewoźników:");
      console.log(`- DPD (42): ${dpd ? `Dostępny, cena: ${dpd.price} PLN` : "Niedostępny"}`);
      console.log(`- InPost (21): ${inpost ? `Dostępny, cena: ${inpost.price} PLN` : "Niedostępny"}`);
    } else {
      console.log("Brak danych o wycenie w odpowiedzi API");
    }
  } catch (error) {
    if ((error as ApiError).status) {
      const apiError = error as ApiError;
      console.error(`Błąd API: ${apiError.status}, wiadomość: ${apiError.message}`);

      if (apiError.data) {
        console.error("Szczegóły błędu:");
        console.dir(apiError.data, { depth: null });
      }
    } else {
      console.error("Wystąpił błąd:", error);
    }
  }
};

// Wywołanie funkcji testującej
main();
