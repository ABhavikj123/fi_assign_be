import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { conflict, unauthorized } from "../lib/errors";
import { prisma } from "../lib/prisma";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const registerUser = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    throw conflict("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash
    }
  });

  return { message: "User registered successfully" };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    throw unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw unauthorized("Invalid email or password");
  }

  const accessToken = jwt.sign(
    {
      email: user.email
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    }
  );

  return { access_token: accessToken };
};
