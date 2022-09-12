import express from "express";
import { cadastro, login, logout } from "../controllers/auth.controllers.js";
import authMiddleware from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/cadastro", cadastro);
router.post("/login", login);

router.use(authMiddleware);
router.delete("/login", logout);

export default router;
