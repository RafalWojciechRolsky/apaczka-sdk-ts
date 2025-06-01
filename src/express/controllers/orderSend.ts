import { Request, Response } from "express";
import createApaczkaSDK from "../../apaczkaApp/apaczka-sdk";
import { OrderRequest } from "../../config/types";
import { APP_ID, APP_SECRET } from "../../config/envs";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

export const orderSend = async (req: Request, res: Response) => {
  try {
    const orderRequest: OrderRequest = req.body as OrderRequest;

    // Przycinanie pola content odbywa się teraz w SDK
    const orderResponse = await sdk.orderSend(orderRequest);
    res.json(orderResponse);
    return;
  } catch (error) {
    console.error("Błąd podczas wysyłania zamówienia:", error);
    res.status(500).json({ error: "Failed to send order" });
  }
};
