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
