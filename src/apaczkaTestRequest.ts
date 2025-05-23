import createApaczkaSDK from "./apaczkaApp/apaczka-sdk";
import { APP_ID, APP_SECRET } from "./config/envs";
import { exampleOrderRequest } from "./config/exampleOrderRequest";
import {
  ApaczkaApiResponse,
  ApaczkaOrderResponse,
  ApaczkaServiceResponse,
  ApiError,
  OrderRequest,
} from "./config/types";
import { promises as fsPromises } from "fs";
import path from "path";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

/**
 * Główna funkcja symulująca wysyłkę zamówienia do API Apaczka
 */
const main = async () => {
  try {
    // Krok 1: Pobieranie struktury serwisów
    console.log(
      "1. Pobieramy strukturę serwisów, aby wybrać odpowiedni service_id"
    );
    const serviceStructureResponse =
      (await sdk.serviceStructure()) as unknown as ApaczkaApiResponse<ApaczkaServiceResponse>;

    // Zapisywanie struktury serwisów do pliku dla przyszłego użytku
    const filePath = path.join(__dirname, "service_structure.json");
    await fsPromises.writeFile(
      filePath,
      JSON.stringify(serviceStructureResponse, null, 2)
    );
    console.log(`Struktura serwisów zapisana do pliku: ${filePath}`);

    // Sprawdzenie czy mamy poprawną odpowiedź z API
    if (
      serviceStructureResponse &&
      serviceStructureResponse.status === 200 &&
      serviceStructureResponse.response &&
      serviceStructureResponse.response.services
    ) {
      console.log("\nDostępne serwisy krajowe:");
      const services = serviceStructureResponse.response.services;

      // Filtrujemy i wyświetlamy serwisy krajowe
      services
        .filter((service) => service.domestic === "1")
        .forEach((service) => {
          console.log(
            `ID: ${service.service_id}, Nazwa: ${service.name}, Dostawca: ${service.supplier}`
          );
        });

      // Krok 2: Przygotowanie zamówienia
      // Dla przykładu używamy DPD Kurier (ID: 21)
      const selectedServiceId = 21;
      const serviceInfo = services.find(
        (s) => s.service_id === selectedServiceId.toString()
      );

      if (!serviceInfo) {
        throw new Error(`Nie znaleziono serwisu o ID: ${selectedServiceId}`);
      }

      console.log(
        `\nWybrany serwis: ${serviceInfo.name} (ID: ${serviceInfo.service_id})`
      );

      const orderRequest: OrderRequest = {
        ...exampleOrderRequest,
        service_id: selectedServiceId,
      };

      // Krok 3: Wysyłanie zamówienia bez etapu wyceny
      console.log(
        "\n2. Wysyłamy zamówienie bezpośrednio do wysyłki (bez etapu wyceny)"
      );
      const orderSendResponse = (await sdk.orderSend(
        orderRequest
      )) as unknown as ApaczkaApiResponse<ApaczkaOrderResponse>;

      // Sprawdzenie czy zamówienie zostało złożone pomyślnie
      if (
        orderSendResponse.status === 200 &&
        orderSendResponse.response &&
        orderSendResponse.response.order
      ) {
        const order = orderSendResponse.response.order;
        console.log("\nZamówienie zostało pomyślnie złożone:");
        console.log(`- ID zamówienia: ${order.id}`);
        console.log(`- Numer listu przewozowego: ${order.waybill_number}`);
        console.log(`- Status: ${order.status}`);
        console.log(`- URL do śledzenia przesyłki: ${order.tracking_url}`);
        console.log(`- Data utworzenia: ${order.created}`);

        // Krok 4: Pobieranie szczegółów utworzonego zamówienia (opcjonalnie)
        console.log("\n3. Pobieramy szczegóły utworzonego zamówienia");
        const orderDetailsResponse = (await sdk.order(
          order.id
        )) as unknown as ApaczkaApiResponse<ApaczkaOrderResponse>;

        if (orderDetailsResponse.status === 200) {
          console.log("Szczegóły zamówienia pobrane pomyślnie");

          // Zapisanie szczegółów zamówienia do pliku
          const orderDetailsPath = path.join(
            __dirname,
            `order_${order.id}_details.json`
          );
          await fsPromises.writeFile(
            orderDetailsPath,
            JSON.stringify(orderDetailsResponse, null, 2)
          );
          console.log(
            `Szczegóły zamówienia zapisane do pliku: ${orderDetailsPath}`
          );
        } else {
          console.log("Nie udało się pobrać szczegółów zamówienia");
        }
      } else {
        console.error("Nie udało się złożyć zamówienia");
        console.dir(orderSendResponse, { depth: null });
      }
    } else {
      console.error("Nie udało się pobrać struktury serwisów");
      console.dir(serviceStructureResponse, { depth: null });
    }
  } catch (error) {
    if ((error as ApiError).status) {
      const apiError = error as ApiError;
      console.error(
        `Błąd API: ${apiError.status}, wiadomość: ${apiError.message}`
      );

      if (apiError.data) {
        console.error("Szczegóły błędu:");
        console.dir(apiError.data, { depth: null });
      }
    } else {
      console.error("Wystąpił błąd:", error);
    }
  }
};

main();
