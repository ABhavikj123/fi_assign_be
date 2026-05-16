import { Router } from "express";
import { about, openApi } from "../controllers/meta.controller";

export const metaRouter = Router();

metaRouter.get("/about", about);
metaRouter.get("/openapi.json", openApi);
