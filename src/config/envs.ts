import dotenv from "dotenv";

dotenv.config();

export const APP_ID = process.env.APP_ID;
export const APP_SECRET = process.env.APP_SECRET;
export const API_URL = process.env.API_URL;
export const PORT = process.env.PORT || 3000;
