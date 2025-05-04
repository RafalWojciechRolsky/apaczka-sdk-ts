import { Request, Response } from "express";
import createApaczkaSDK from "../../apaczkaApp/apaczka-sdk";
import { APP_ID, APP_SECRET } from "../../config/envs";

if (!APP_ID || !APP_SECRET) {
  throw new Error("APP_ID or APP_SECRET is not set in .env file");
}

const sdk = createApaczkaSDK(APP_ID, APP_SECRET);

// Interfejs dla odpowiedzi API Apaczki
interface ApaczkaResponse {
  status: number;
  message: string;
  response: any;
}

// Interfejs dla danych klienta otrzymanych z formularza
interface CustomerRegisterRequest {
  name: string;
  email: string;
  contactPerson: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  province: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

// Funkcja przygotowująca dane klienta do formatu wymaganego przez API Apaczki
const prepareCustomerData = (reqData: CustomerRegisterRequest) => {
  // Formatujemy dane zgodnie z oczekiwaniami API Apaczki
  return {
    name: reqData.name,
    email: reqData.email,
    contactPerson: reqData.contactPerson,
    address: {
      street: reqData.street,
      buildingNumber: reqData.buildingNumber,
      apartmentNumber: reqData.apartmentNumber || "",
      city: reqData.city,
      postalCode: reqData.postalCode,
      province: reqData.province,
      country: reqData.country,
    },
    phone: reqData.phone,
  };
};

/**
 * Controller obsługujący rejestrację klienta w systemie Apaczka
 */
export const customerRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("==========================================");
  console.log("Rozpoczęcie rejestracji klienta");
  console.log("Otrzymane dane:", JSON.stringify(req.body, null, 2));
  console.log("==========================================");

  try {
    // Weryfikacja wymaganych pól
    const requiredFields = [
      "name",
      "email",
      "street",
      "buildingNumber",
      "postalCode",
      "city",
      "country",
      "phone",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      console.error("Brakujące pola w żądaniu", { missingFields });
      res.status(400).json({
        success: false,
        message: `Brakujące wymagane pola: ${missingFields.join(", ")}`,
      });
      return;
    }

    // Przygotowanie danych do formatu wymaganego przez API
    const customerData = prepareCustomerData(
      req.body as CustomerRegisterRequest
    );
    console.log("Przygotowanie danych do formatu wymaganego przez API", {
      customerData,
    });

    // Wywołanie SDK do rejestracji klienta
    const result = await sdk.customerRegister(customerData) as ApaczkaResponse;
    console.log("Odpowiedź z API Apaczka:", { result });

    // Sprawdzenie statusu odpowiedzi z API Apaczki
    if (result && typeof result === 'object' && 'status' in result) {
      if (result.status === 200) {
        // Sukces - klient został zarejestrowany
        res.status(200).json({
          success: true,
          message: "Klient został pomyślnie zarejestrowany",
          data: result,
        });
      } else {
        // Błąd zwrócony przez API Apaczki
        console.error("Błąd zwrócony przez API Apaczki", { result });
        res.status(result.status).json({
          success: false,
          message: result.message || "Błąd podczas rejestracji klienta w API Apaczki",
          data: result,
        });
      }
    } else {
      // Nieoczekiwany format odpowiedzi
      console.error("Nieoczekiwany format odpowiedzi z API Apaczki", { result });
      res.status(500).json({
        success: false,
        message: "Nieoczekiwany format odpowiedzi z API Apaczki",
        data: result,
      });
    }
  } catch (error) {
    console.error("Błąd podczas rejestracji klienta", { error });

    // Obsługa błędów
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: `Błąd podczas rejestracji klienta: ${error.message}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Nieznany błąd podczas rejestracji klienta",
      });
    }
  }
};
