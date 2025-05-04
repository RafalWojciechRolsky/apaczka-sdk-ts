import { Request, Response } from "express";
import createApaczkaSDK from "../../apaczkaApp/apaczka-sdk";
import { APP_ID, APP_SECRET } from "../../config/envs";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

export const serviceStructure = async (req: Request, res: Response) => {
  try {
    console.log("Pobieranie struktury serwisów...");
    const structure = await sdk.serviceStructure();
    console.log("Struktura serwisów pobrana pomyślnie");
    
    res.status(200).json(structure);
  } catch (error) {
    console.error("Błąd podczas pobierania struktury serwisów", { error });
    
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: `Błąd podczas pobierania struktury serwisów: ${error.message}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Nieznany błąd podczas pobierania struktury serwisów",
      });
    }
  }
};
