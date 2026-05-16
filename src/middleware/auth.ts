import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { unauthorized } from "../lib/errors";

type JwtPayload = {
  sub: string;
  email: string;
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return next(unauthorized("Missing or invalid Authorization header"));
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email
    };
    return next();
  } catch {
    return next(unauthorized("Invalid or expired token"));
  }
};
