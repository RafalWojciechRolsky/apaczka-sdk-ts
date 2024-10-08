import { Request, Response } from "express";
import createApaczkaSDK from "../../apaczkaApp/apaczka-sdk";
import { OrderRequest } from "../../config/types";
import { APP_ID, APP_SECRET } from "../../config/envs";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

export const orderValuation = async (req: Request, res: Response) => {
  try {
    const orderRequest: OrderRequest = req.body as OrderRequest;
    delete orderRequest.service_id;
    const valuation = await sdk.orderValuation(orderRequest);
    res.json(valuation);
    return;
  } catch (error) {
    res.status(500).json({ error: "Failed to get order valuation" });
  }
};
