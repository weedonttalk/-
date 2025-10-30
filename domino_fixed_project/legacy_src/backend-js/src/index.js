import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes.js';
import { connectMongo } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

await connectMongo();
app.use(router);

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=> console.log(`Domino JS API (Mongo, 4-way, AI) on :${PORT}`));
