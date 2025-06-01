import { ApaczkaSDK, OrderRequest } from "../config/types";
import { sendRequest } from "./utils/sendRequest";

const createApaczkaSDK = (appID: string, appSecret: string): ApaczkaSDK => {
  const send = sendRequest(appID, appSecret);

  return {
    order: (id: string) => send(`order/${id}/`),
    orders: (page = 1, limit = 10) => send(`orders/`, { page, limit }),
    waybill: (id: string) => send(`waybill/${id}/`),
    pickupHours: (postalCode: string, serviceId: string | null = null) =>
      send(`pickup_hours/`, { postal_code: postalCode, service_id: serviceId }),
    orderValuation: (order: OrderRequest) => {
      // Przycinamy pole content do maksymalnie 49 znaków dla DPD (service_id: 21)
      if (order.content && order.content.length > 49) {
        console.log(`Przycinam content z ${order.content.length} znaków do 49 znaków`);
        order.content = order.content.substring(0, 49);
      }
      return send(`order_valuation/`, { order });
    },
    orderSend: (order: OrderRequest) => {
      // Przycinamy pole content do maksymalnie 49 znaków dla DPD (service_id: 21)
      if (order.content && order.content.length > 49) {
        console.log(`Przycinam content z ${order.content.length} znaków do 49 znaków`);
        order.content = order.content.substring(0, 49);
      }
      return send(`order_send/`, { order });
    },
    cancelOrder: (id: string) => send(`cancel_order/${id}/`),
    serviceStructure: () => send(`service_structure/`),
    points: (type: string | null = null) => send(`points/${type}/`),
    customerRegister: (customer: Record<string, unknown>) =>
      send(`customer_register/`, { customer }),
    turnIn: (orderIds: string[]) => send(`turn_in/`, { order_ids: orderIds }),
  };
};

export default createApaczkaSDK;
