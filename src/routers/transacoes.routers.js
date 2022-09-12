import express from "express";
import {
  listaTransacoes,
  novaTransacao,
  deletarTransacao,
} from "../controllers/transacoes.controllers.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
import validaTransacaoMiddleware from "../middlewares/validaTransacao.middlewares.js";
import validaUsuarioMiddleware from "../middlewares/validaUsuario.middlewares.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/transacoes", listaTransacoes);

router.post("/transacoes", validaTransacaoMiddleware, novaTransacao);

router.delete(
  "/transacoes/:transacaoId",
  validaUsuarioMiddleware,
  deletarTransacao
);

export default router;
