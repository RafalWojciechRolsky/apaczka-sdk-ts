import createApaczkaSDK from "./app/apaczka-sdk";
import { APP_ID, APP_SECRET } from "./app/config/envs";
import { exampleOrderRequest } from "./app/config/exampleOrderRequest";
import { ApiError } from "./app/config/types";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

const main = async () => {
  try {
    console.log("1. Sprawdzamy ile i jakie są zamówienia");
    const orders = await sdk.orders();
    console.dir(orders, { depth: null });

    // console.log("2. Pobieramy szczegóły konkretnego zamówienia");
    // const orderDetails = await sdk.order("451165840");
    // console.dir({ orderDetails }, { depth: null });

    // console.log("3. Pobieramy strukturę serwisów");
    // const serviceStructure = await sdk.serviceStructure();
    // console.log("Service structure pobrana");

    // const filePath = path.join(__dirname, "service_structure.json");
    // await fs.writeFile(filePath, JSON.stringify(serviceStructure, null, 2));
    // console.log(`Struktura serwisów zapisana do pliku: ${filePath}`);

    // console.log("4. Wysyłamy zamówienie do wyceny");
    // const orderValuation = await sdk.orderValuation(exampleOrderRequest);
    // console.dir(orderValuation, { depth: null });

    // console.log("5. Wysyłamy zamówienie do wysyłki");
    // const orderSend = await sdk.orderSend(exampleOrderRequest);
    // console.dir(orderSend, { depth: null });
  } catch (error) {
    if ((error as ApiError).status) {
      const apiError = error as ApiError;
      console.error(
        `API Error (Status ${apiError.status}): ${apiError.message}`
      );
      if (apiError.data) {
        console.error("Error details:", apiError.data);
      }
    } else {
      console.error("Unexpected error:", error);
    }
  }
};

main().catch((error) => {
  console.error("Unhandled error in main function:", error);
  process.exit(1);
});
