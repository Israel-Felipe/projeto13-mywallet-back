import express, { application } from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv'; dotenv.config();
import dayjs from 'dayjs';
import joi from 'joi';
import bcrypt from 'bcrypt';

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db('myWallet');
});

const app = express();
app.use(cors());
app.use(express.json());


const cadastroSchema = joi.object({
    nome: joi.string().min(1).required().trim(),
    email: joi.string().min(1).required().trim(),
    senha: joi.string().min(1).required().trim(),
    confirmaSenha: joi.string().required()
});

const loginSchema = joi.object({
    email: joi.string().min(1).required().trim(),
    senha: joi.string().min(1).required().trim()
});

app.post('/cadastro', async (req, res) => {
    const { nome, email, senha, confirmaSenha } = req.body;

    const validation = cadastroSchema.validate(req.body, {abortEarly: false } );
    if (validation.error) {
        const error = validation.error.details.map((error) => error.message);
        res.status(422).send(error);
        return;
    }

    if (confirmaSenha !== senha) {
        res.status(400).send({message: 'Confirmação de senha incorreta'});
            return;
    }

    try {
        const senhaHash = bcrypt.hashSync(senha, 10);
        const usuario = {
            nome,
            email,
            senha: senhaHash
        }

        if (await db.collection('usuarios').findOne({email})) {
            res.status(409).send({message: 'Email já cadastrado'});
            return;
        };

        

        await db.collection('usuarios').insertOne(usuario);
        res.sendStatus(201);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    };
});

app.get('/cadastro', async (req, res) => {
    try {
        const usuarios = await db.collection('usuarios').find().toArray();
        res.status(200).send(usuarios);
      } catch (error) {
        console.error(error);
        res.sendStatus(500);
      }
});


app.post('/login', async (req, res) => {
    const { email, senha} = req.body;

    const validation = loginSchema.validate(req.body, {abortEarly: false } );
    if (validation.error) {
        const error = validation.error.details.map((error) => error.message);
        res.status(422).send(error);
        return;
    }

    try {

        const usuario = await db.collection('usuarios').findOne({email});
        
        if(usuario && bcrypt.compareSync(senha, usuario.senha)) {
            res.status(200).send(`Sucesso! Usuário encontrado: ${usuario.nome}`);
        } else {
            res.status(400).send('email ou senha incorretos');
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    };
});

app.listen(5000, () => console.log("Servidor rodando na porta 5000"));

/* israel@gmail.com */