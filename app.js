import express from "express";
import dotenv from "dotenv";
import applyMiddlewares from "./middleware/index.js";
import allRoutes from "./routes/index.js";
import errorMiddleware from "./middleware/errorHandler.js";
import { connectToMongoDB } from "./config/connect.js";

dotenv.config();
const app = express();

// connect DB
connectToMongoDB();

// apply all middlewares
applyMiddlewares(app);

/**
 * WARNING: Do NOT add routes directly in app.js
 * All routes must be registered inside routes/index.js
 */

app.use("/v1", allRoutes);
app.use('/v1/health', (req, res) => {
    res.status(200).json({ work: "YES" })
})
// error handler
app.use(errorMiddleware);

export default app;
