import { Request, Response } from "express";

export const helloWorldRoute = (_req: Request, res: Response) => {
  res.json({ message: "Hello World" });
  return;
};
