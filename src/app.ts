import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { generalRateLimit } from "./middleware/rate-limit";
import { authRouter } from "./routes/auth.routes";
import { metaRouter } from "./routes/meta.routes";
import { notesRouter } from "./routes/notes.routes";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin:
        env.CORS_ORIGIN === "*"
          ? true
          : env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: false
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(generalRateLimit);

  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "Notes API is running",
      docs: "/openapi.json"
    });
  });

  app.use(metaRouter);
  app.use(authRouter);
  app.use(notesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
