import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await registerUser(email, password);
  return res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  return res.status(200).json(result);
};
