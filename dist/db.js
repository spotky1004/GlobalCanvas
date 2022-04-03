import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
dotenv.config();
const uri = `mongodb+srv://spotky1004:${process.env.MONGODB_PASSWORD}@cluster0.rlp2b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const dbName = 'GlobalCanvas';
await client.connect();
const db = client.db(dbName);
const collection = db.collection("data");
const ID = "canvas";
async function init(size) {
    const pixels = new Array(size.height).fill(undefined).map(_ => new Array(size.width).fill(-1));
    await savePixels(pixels);
    return pixels;
}
async function savePixels(pixels) {
    await collection.updateOne({ _id: ID }, { $set: { pixels: toSavedataForm(pixels) } }, { upsert: true });
}
async function loadPixels(size) {
    const saveExists = await collection.count({ _id: ID }, { limit: 1 });
    if (saveExists) {
        const document = await collection.findOne({ _id: ID });
        return toMatrixForm(document.pixels);
    }
    else {
        return await init(size);
    }
}
function toSavedataForm(matrix) {
    return [...matrix].map(v => v.join(",")).join("|");
}
function toMatrixForm(data) {
    return data.split("|").map(v => v.split(",").map(v => Number(v)));
}
export { savePixels, loadPixels };
