import { db } from "../database/db.js";
import { ObjectId } from "mongodb";

async function validaUsuario(req, res, next) {
  const { transacaoId } = req.params;
  const usuario = res.locals.usuario;
  const query = { _id: new ObjectId(transacaoId) };

  try {
    const transacao = await db.collection("transacoes").findOne(query);

    if (!transacao) {
      res.status(404).send({ message: "erro na transação" });
      return;
    }

    if (!usuario._id.equals(transacao.usuarioId)) {
      res.status(401).send({ message: "usuario não autorizado" });
      return;
    }

    res.locals.transacaoId = query;
    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export default validaUsuario;
