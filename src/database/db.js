import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  mongoClient.connect();
} catch {
  res.sendStatus(500, "Couldn't connect to Mongo");
}

export const db = mongoClient.db("myWallet");
