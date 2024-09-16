export interface OrderRequest {
  service_id: number;
  address: {
    sender: Address;
    receiver: Address;
  };
  option?: Record<string, number>;
  notification?: {
    new?: NotificationOptions;
    sent?: NotificationOptions;
    exception?: NotificationOptions;
    delivered?: NotificationOptions;
  };
  shipment_value?: number;
  cod?: {
    amount: number;
    bankaccount: string;
  };
  pickup?: {
    type: string;
    date: string;
    hours_from: string;
    hours_to: string;
  };
  shipment: Shipment[];
  comment?: string;
  content?: string;
  is_zebra?: number;
}

export interface Address {
  country_code: string;
  name: string;
  line1: string;
  line2?: string;
  postal_code: string;
  state_code?: string;
  city: string;
  is_residential: number;
  contact_person?: string;
  email?: string;
  phone?: string;
  foreign_address_id?: string;
}

export interface NotificationOptions {
  isReceiverEmail?: number;
  isReceiverSms?: number;
  isSenderEmail?: number;
  isSenderSms?: number;
}

export interface Shipment {
  dimension1: number;
  dimension2: number;
  dimension3: number;
  weight: number;
  is_nstd: number;
  shipment_type_code: string;
  customs_data?: CustomsData[];
}

export interface CustomsData {
  name: string;
  description: string;
  made_in: string;
  unit_type: "PCS" | "PKG";
  unit_price: number;
  unit_weight: number;
  quantity: number;
}

export interface OrderResponse {
  id: string;
  service_id: string;
  service_name: string;
  waybill_number: string;
  tracking_url: string;
  status: string;
  shipments_count: number;
  content: string;
  comment: string;
  receiver: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    line1: string;
    line2: string;
    postal_code: string;
    city: string;
    country_code: string;
    foreign_address_id: string;
  };
  created: string;
  delivered: string;
}

export interface OrdersResponse {
  orders: OrderResponse[];
}

export interface WaybillResponse {
  waybill: string;
  type: string;
}

export interface PickupHoursResponse {
  postal_code: string;
  hours: {
    [date: string]: {
      date: string;
      services: Array<{
        service: string;
        timefrom: string;
        timeto: string;
      }>;
    };
  };
}

export interface OrderValuationResponse {
  price_table: {
    [serviceId: string]: {
      price: string;
      price_gross: string;
    };
  };
}

export interface ServiceStructureResponse {
  services: Array<{
    service_id: string;
    name: string;
    delivery_time: string;
    supplier: string;
    domestic: string;
    pickup_courier: string;
    door_to_door: string;
    door_to_point: string;
    point_to_point: string;
    point_to_door: string;
  }>;
  options: {
    [optionId: string]: {
      type: string;
      name: string;
      desc: string;
    };
  };
  package_type: {
    [type: string]: {
      type: string;
      desc: string;
    };
  };
  points_type: string[];
}

export interface PointsResponse {
  points: {
    [pointId: string]: {
      type: string;
      name: string;
      address: {
        line1: string;
        line2: string;
        state_code: string;
        postal_code: string;
        country_code: string;
        city: string;
        longitude: string;
        latitude: string;
      };
      image_url: string;
      open_hours: string;
      option_cod: boolean;
      option_send: boolean;
      option_deliver: boolean;
      additional_info: string;
      distance: number;
      foreign_address_id: string;
    };
  };
}

export interface TurnInResponse {
  turn_in: string;
}

export interface ApaczkaSDK {
  order: (id: string) => Promise<OrderResponse>;
  orders: (page?: number, limit?: number) => Promise<OrdersResponse>;
  waybill: (id: string) => Promise<WaybillResponse>;
  pickupHours: (
    postalCode: string,
    serviceId?: string | null
  ) => Promise<PickupHoursResponse>;
  orderValuation: (order: OrderRequest) => Promise<OrderValuationResponse>;
  orderSend: (order: OrderRequest) => Promise<OrderResponse>;
  cancelOrder: (id: string) => Promise<void>;
  serviceStructure: () => Promise<ServiceStructureResponse>;
  points: (type?: string | null) => Promise<PointsResponse>;
  customerRegister: (customer: Record<string, unknown>) => Promise<unknown>;
  turnIn: (orderIds: string[]) => Promise<TurnInResponse>;
}
