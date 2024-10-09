import { OrderRequest } from "./types";

export const exampleOrderRequest: OrderRequest = {
  // service_id: 21,
  address: {
    sender: {
      country_code: "PL",
      name: "Skladmuzyczny.pl",
      line1: "ul. Skawińska 14",
      line2: "",
      postal_code: "31-066",
      city: "Kraków",
      is_residential: 0,
      contact_person: "Rafał Majewski",
      email: "zamowienia@skladmuzyczny.pl",
      phone: "123461842",
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
      phone: "987654321",
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
