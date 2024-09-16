import createApaczkaSDK from "./app/apaczka-sdk";
import { APP_ID, APP_SECRET } from "./app/config";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

async function main() {
  try {
    const orders = await sdk.orders();
    console.dir(orders, { depth: null });
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
