import crypto from "node:crypto";

const SIGN_ALGORITHM = "sha256";

export const getSignature = (string: string, key: string): string => {
  const signature = crypto
    .createHmac(SIGN_ALGORITHM, key)
    .update(string)
    .digest("hex");
  return signature;
};

export const stringToSign = (
  appId: string,
  route: string,
  data: string,
  expires: number
): string => {
  const result = `${appId}:${route}:${data}:${expires}`;
  return result;
};
