import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { asyncHandler } from "../lib/async-handler";
import { authRateLimit } from "../middleware/rate-limit";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/auth";

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimit,
  validate(registerSchema, "body"),
  asyncHandler(register)
);

authRouter.post(
  "/login",
  authRateLimit,
  validate(loginSchema, "body"),
  asyncHandler(login)
);
