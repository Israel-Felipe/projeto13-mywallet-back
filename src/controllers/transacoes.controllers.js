import dayjs from "dayjs";
import { db } from "../database/db.js";

export async function novaTransacao(req, res) {
  const { valor, descricao, tipo } = req.body;
  const usuario = res.locals.usuario;

  try {
    await db.collection("transacoes").insertOne({
      valor: Number(valor).toFixed(2),
      descricao,
      tipo,
      data: dayjs().format("DD/MM/YYYY"),
      usuarioId: usuario._id,
    });

    res.status(201).send({ message: "Sucesso na transação" });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function listaTransacoes(req, res) {
  const usuario = res.locals.usuario;
  const query = { usuarioId: usuario._id };
  const invert = {
    sort: {
      _id: -1,
    },
  };

  try {
    const transacoes = await db
      .collection("transacoes")
      .find(query, invert)
      .project({ usuarioId: 0 })
      .toArray();

    res.status(200).send(transacoes);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function deletarTransacao(req, res) {
  const query = res.locals.transacaoId;

  try {
    await db.collection("transacoes").deleteOne(query);

    res.status(200).send({ message: "Transacao deletada" });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
