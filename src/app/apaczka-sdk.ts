import { API_URL } from "./config";
import { ApaczkaSDK, OrderRequest } from "./types";
import { buildRequest } from "./utils";

const sendRequest =
  (appID: string, appSecret: string) =>
  async (
    route: string,
    data: Record<string, unknown> | null = null
  ): Promise<any> => {
    const request = buildRequest(appID, appSecret)(route, data);

    try {
      const response = await fetch(`${API_URL}${route}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: request,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Request error:", error);
      throw error;
    }
  };

const createApaczkaSDK = (appID: string, appSecret: string): ApaczkaSDK => {
  const send = sendRequest(appID, appSecret);

  return {
    order: (id: string) => send(`order/${id}/`),
    orders: (page = 1, limit = 10) => send(`orders/`, { page, limit }),
    waybill: (id: string) => send(`waybill/${id}/`),
    pickupHours: (postalCode: string, serviceId: string | null = null) =>
      send(`pickup_hours/`, { postal_code: postalCode, service_id: serviceId }),
    orderValuation: (order: OrderRequest) =>
      send(`order_valuation/`, { order }),
    orderSend: (order: OrderRequest) => send(`order_send/`, { order }),
    cancelOrder: (id: string) => send(`cancel_order/${id}/`),
    serviceStructure: () => send(`service_structure/`),
    points: (type: string | null = null) => send(`points/${type}/`),
    customerRegister: (customer: Record<string, unknown>) =>
      send(`customer_register/`, { customer }),
    turnIn: (orderIds: string[]) => send(`turn_in/`, { order_ids: orderIds }),
  };
};

export default createApaczkaSDK;
