import { Request, Response } from "express";
import createApaczkaSDK from "../../apaczkaApp/apaczka-sdk";
import { ApiError, OrderRequest } from "../../config/types";
import { APP_ID, APP_SECRET } from "../../config/envs";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

/**
 * Kontroler obsługujący wycenę zamówienia
 * Przyjmuje dane zamówienia w formacie API Apaczka i zwraca wycenę dla dostępnych serwisów
 */
export const orderValuation = async (req: Request, res: Response) => {
  try {
    console.log("Wyceniam zamówienie...");
    // Pobieramy dane zamówienia z żądania
    const orderRequest = req.body as OrderRequest;

    // Usuwamy service_id, ponieważ przy wycenie nie jest potrzebne
    delete orderRequest.service_id;

    // Przycinanie pola content odbywa się teraz w SDK

    // Wywołujemy API Apaczka do wyceny
    const valuation = await sdk.orderValuation(orderRequest);
    // Zwracamy pełną odpowiedź z API
    res.json(valuation);
  } catch (error) {
    console.error("Błąd podczas wyceny zamówienia:", error);

    // Jeśli to jest błąd API, zwracamy jego szczegóły
    if ((error as ApiError).status) {
      const apiError = error as ApiError;
      res.status(apiError.status).json({
        status: apiError.status,
        message: apiError.message,
        error: apiError.data,
      });
      return;
    }

    // W przeciwnym razie zwracamy ogólny błąd 500
    res.status(500).json({
      status: 500,
      message: "Nie udało się wykonać wyceny zamówienia",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
