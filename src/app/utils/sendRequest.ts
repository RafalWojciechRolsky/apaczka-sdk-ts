import axios, { AxiosError } from "axios";
import { API_URL } from "../config/envs";
import { buildRequest } from "./buildRequest";
import { ApiError } from "../config/types";

export const sendRequest =
  (appID: string, appSecret: string) =>
  async (
    route: string,
    data: Record<string, unknown> | null = null
  ): Promise<any> => {
    const request = buildRequest(appID, appSecret)(route, data);

    try {
      const response = await axios.post(`${API_URL}${route}`, request, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
      const apiError: ApiError = {
        message: "Unknown error occurred",
        status: 500,
      };

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        apiError.message = axiosError.message;
        apiError.status = axiosError.response?.status || 500;
        apiError.data = axiosError.response?.data;
      } else if (error instanceof Error) {
        apiError.message = error.message;
      }

      console.error("Request error:", apiError);
      throw apiError;
    }
  };
