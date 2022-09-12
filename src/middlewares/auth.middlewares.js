import { db } from "../database/db.js";

async function verificaAutorizacao(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const session = await db.collection("sessions").findOne({ token });

    if (!session) {
      res.sendStatus(401);
      return;
    }

    const usuario = await db
      .collection("usuarios")
      .findOne({ _id: session.usuarioId });

    console.log(session);

    if (!usuario) {
      res.sendStatus(401);
      return;
    }

    delete usuario.senha;
    res.locals.usuario = usuario;
    res.locals.token = token;
    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export default verificaAutorizacao;
