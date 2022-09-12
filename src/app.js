import express from "express";
import cors from "cors";
import authRouter from "./routers/auth.routers.js";
import transacoesRouters from "./routers/transacoes.routers.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(transacoesRouters);

app.listen(5000, () => console.log("Servidor ouvindo porta 5000"));
