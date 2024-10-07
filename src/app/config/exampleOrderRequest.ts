import { OrderRequest } from "./types";

export const exampleOrderRequest: OrderRequest = {
  // service_id: 21,
  address: {
    sender: {
      country_code: "PL",
      name: "Jan Kowalski",
      line1: "ul. Przykładowa 1",
      line2: "",
      postal_code: "00-001",
      city: "Warszawa",
      is_residential: 0,
      contact_person: "Jan Kowalski",
      email: "jan.kowalski@example.com",
      phone: "+48123456789",
    },
    receiver: {
      country_code: "PL",
      name: "Anna Nowak",
      line1: "ul. Testowa 2",
      line2: "",
      postal_code: "00-002",
      city: "Kraków",
      is_residential: 1,
      contact_person: "Anna Nowak",
      email: "anna.nowak@example.com",
      phone: "+48987654321",
    },
  },
  option: {},
  shipment_value: 10000,
  pickup: {
    type: "SELF",
    date: "2024-11-15",
    hours_from: "09:00",
    hours_to: "17:00",
  },
  shipment: [
    {
      dimension1: 10,
      dimension2: 20,
      dimension3: 30,
      shipment_type_code: "PACZKA",
      weight: 1,
      is_nstd: 0,
    },
  ],
  comment: "komentarz",
  content: "zawartosc",
};
