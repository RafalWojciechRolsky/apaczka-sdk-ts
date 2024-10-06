import { API_URL } from "../config/envs";
import { buildRequest } from "./buildRequest";

export const sendRequest =
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
