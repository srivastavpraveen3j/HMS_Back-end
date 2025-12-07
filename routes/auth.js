import express from "express";
const router = express.Router();

import { loginController } from "../controllers/auth.js";
// import { registerController } from "../controllers/auth.js";


router.post("/login", loginController);
// router.post("/register",registerController);    

export default router;
