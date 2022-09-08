import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
import dayjs from "dayjs";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("myWallet");
});

const app = express();
app.use(cors());
app.use(express.json());

const cadastroSchema = joi.object({
  nome: joi.string().min(1).required().trim(),
  email: joi.string().min(1).required().trim(),
  senha: joi.string().min(1).required().trim(),
  confirmaSenha: joi.string().required(),
});

const loginSchema = joi.object({
  email: joi.string().min(1).required().trim(),
  senha: joi.string().min(1).required().trim(),
});

const operacoesSchema = joi.object({
  valor: joi.number().min(1).required(),
  descricao: joi.string().min(1).required().trim(),
  idusuario: joi.required(),
  operacao: joi.valid("entrada").valid("saida").required(),
  data: joi.required(),
});

function auth(authorization) {
  const token = authorization?.replace("Bearer ", "");
  const session = db.collection("sessions").findOne({ token });
  return session;
}

app.post("/cadastro", async (req, res) => {
  const { nome, email, senha, confirmaSenha } = req.body;

  const validation = cadastroSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    const error = validation.error.details.map((error) => error.message);
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
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const validation = loginSchema.validate(req.body, { abortEarly: false });
  if (validation.error) {
    const error = validation.error.details.map((error) => error.message);
    res.status(422).send(error);
    return;
  }

  try {
    const usuario = await db.collection("usuarios").findOne({ email });

    if (usuario && bcrypt.compareSync(senha, usuario.senha)) {
      const token = uuid();

      await db.collection("sessions").insertOne({
        idusuario: usuario._id,
        token,
      });

      res.status(200).send({
        message: `Sucesso! Usuário encontrado: ${usuario.nome}`,
        token,
      });
    } else {
      res.status(400).send("email ou senha incorretos");
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/home", async (req, res) => {
  const { authorization } = req.headers;

  const session = await auth(authorization);
  if (!session) return res.sendStatus(401);

  try {
    const usuario = await db
      .collection("usuarios")
      .findOne({ _id: session.idusuario });

    if (usuario) delete usuario.senha;

    const entradas = await db
      .collection("operacoes")
      .find({ idusuario: session.idusuario })
      .toArray();

    res.status(200).send(entradas);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/entrada", async (req, res) => {
  const { authorization } = req.headers;
  const { valor, descricao } = req.body;

  const session = await auth(authorization);
  if (!session) return res.sendStatus(401);

  const entrada = {
    valor,
    descricao,
    idusuario: session.idusuario,
    operacao: "entrada",
    data: dayjs().format("DD/MM/YYYY"),
  };

  const validation = operacoesSchema.validate(entrada, { abortEarly: false });
  if (validation.error) {
    const error = validation.error.details.map((error) => error.message);
    res.status(422).send(error);
    return;
  }

  try {
    await db.collection("operacoes").insertOne(entrada);
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/saida", async (req, res) => {
  const { authorization } = req.headers;
  const { valor, descricao } = req.body;

  const session = await auth(authorization);
  if (!session) return res.sendStatus(401);

  const saida = {
    valor,
    descricao,
    idusuario: session.idusuario,
    operacao: "saida",
    data: dayjs().format("DD/MM/YYYY"),
  };

  const validation = operacoesSchema.validate(saida, { abortEarly: false });
  if (validation.error) {
    const error = validation.error.details.map((error) => error.message);
    res.status(422).send(error);
    return;
  }

  try {
    await db.collection("operacoes").insertOne(saida);
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(5000, () => console.log("Servidor rodando na porta 5000"));

/* israel@gmail.com - abc123 */

/* paola@gmail.com - paola123 */

/* lully@gmail.com - lully123 */
