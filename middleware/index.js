import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { getNamespaceByApiKey } from "./NameSpace.js";
import activityLogMiddleware from "./ActivityLog.js";
import express from "express";

export default function applyMiddlewares(app) {
  app.use(morgan("dev"));
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
  app.use(compression());
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH",  "OPTIONS"],
      credentials: true,
    })
  );

  // static uploads
  app.use(
    "/uploads",
    (req, res, next) => {
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      });
      next();
    },
    express.static("uploads")
  );

  // custom middlewares
  // app.use(getNamespaceByApiKey);
  // app.use(activityLogMiddleware);
}