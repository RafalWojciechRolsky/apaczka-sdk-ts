import crypto from "node:crypto";

const SIGN_ALGORITHM = "sha256";

export const getSignature = (string: string, key: string): string =>
  crypto.createHmac(SIGN_ALGORITHM, key).update(string).digest("hex");

export const stringToSign = (
  appId: string,
  route: string,
  data: string,
  expires: number
): string => `${appId}:${route}:${data}:${expires}`;

export const buildRequest =
  (appID: string, appSecret: string) =>
  (route: string, data: Record<string, unknown> | null = null): string => {
    const jsonData = JSON.stringify(data);
    const expires = Math.floor(Date.now() / 1000) + 30 * 60;
    const signature = getSignature(
      stringToSign(appID, route, jsonData, expires),
      appSecret
    );

    return `app_id=${appID}&request=${jsonData}&expires=${expires}&signature=${signature}`;
  };
