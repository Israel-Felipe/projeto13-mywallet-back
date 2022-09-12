import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { db } from "../database/db.js";
import joi from "joi";

const cadastroSchema = joi.object({
  nome: joi.string().max(20).required().trim(),
  email: joi.string().email().required(),
  senha: joi.string().required(),
  confirmaSenha: joi.ref("senha"),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  senha: joi.string().required(),
});

export async function cadastro(req, res) {
  const { nome, email, senha, confirmaSenha } = req.body;

  const validacao = cadastroSchema.validate(req.body, { abortEarly: false });
  if (validacao.error) {
    const error = validacao.error.details.map((error) => error.message);
    res.status(422).send(error);
    return;
  }

  if (confirmaSenha !== senha) {
    res.status(400).send({ message: "Confirmação de senha incorreta" });
    return;
  }

  try {
    const senhaHash = bcrypt.hashSync(senha, 10);
    const usuario = {
      nome,
      email,
      senha: senhaHash,
    };

    if (await db.collection("usuarios").findOne({ email })) {
      res.status(409).send({ message: "Email já cadastrado" });
      return;
    }

    await db.collection("usuarios").insertOne(usuario);
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

export async function login(req, res) {
  const { email, senha } = req.body;

  const validacao = loginSchema.validate(req.body, { abortEarly: false });
  if (validacao.error) {
    const error = validacao.error.details.map((error) => error.message);
    res.status(422).send(error);
    return;
  }

  try {
    const usuario = await db.collection("usuarios").findOne({ email });

    if (usuario && bcrypt.compareSync(senha, usuario.senha)) {
      const token = uuid();

      await db.collection("sessions").insertOne({
        usuarioId: usuario._id,
        token,
      });

      delete usuario.senha;

      res.status(200).send({
        message: `Sucesso! Usuário encontrado: ${usuario.nome}`,
        token,
      });
    } else {
      res.status(401).send("email ou senha incorretos");
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

export async function logout(req, res) {
  const token = res.locals.token;

  try {
    await db.collection("sessions").deleteOne({ token });

    res.send({ message: "logout realizado" });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
