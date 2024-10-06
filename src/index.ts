import createApaczkaSDK from "./app/apaczka-sdk";
import { APP_ID, APP_SECRET } from "./app/config/envs";
import { exampleOrderRequest } from "./app/config/exampleOrderRequest";
// import { OrderRequest, ServiceStructureResponse } from "./app/config/types";
// import fs from "fs/promises";
// import path from "path";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

const main = async () => {
  try {
    // console.log("1. Sprawdzamy ile i jakie są zamówienia");
    // const orders = await sdk.orders();
    // console.dir(orders, { depth: null });

    // console.log("2. Pobieramy szczegóły konkretnego zamówienia");
    // const orderDetails = await sdk.order("451165840");
    // console.dir({ orderDetails }, { depth: null });

    // console.log("3. Pobieramy strukturę serwisów");
    // const serviceStructure = await sdk.serviceStructure();
    // console.log("Service structure pobrana");

    // const filePath = path.join(__dirname, "service_structure.json");
    // await fs.writeFile(filePath, JSON.stringify(serviceStructure, null, 2));
    // console.log(`Struktura serwisów zapisana do pliku: ${filePath}`);

    console.log("4. Wysyłamy zamówienie do wyceny");
    const orderValuation = await sdk.orderValuation(exampleOrderRequest);
    console.log("Order valuation response:", orderValuation);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
