import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
dotenv.config();
const uri = `mongodb+srv://spotky1004:${process.env.MONGODB_PASSWORD}@cluster0.rlp2b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const dbName = 'GlobalCanvas';

await client.connect();
const db = client.db(dbName);

const data = db.collection("data");
const log = db.collection("fill-log");

export {
  data,
  log
};
