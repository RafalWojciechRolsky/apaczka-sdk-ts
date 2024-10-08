import { getSignature, stringToSign } from "./getSignature";

export const buildRequest =
  (appID: string, appSecret: string) =>
  (route: string, data: Record<string, unknown> | null = null): string => {
    const jsonData = data ? JSON.stringify(data) : "{}";
    const expires = Math.floor(Date.now() / 1000) + 30 * 60;
    const signature = getSignature(
      stringToSign(appID, route, jsonData, expires),
      appSecret
    );

    return `app_id=${appID}&request=${encodeURIComponent(
      jsonData
    )}&expires=${expires}&signature=${signature}`;
  };
