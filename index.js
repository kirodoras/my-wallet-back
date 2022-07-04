import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { registerUser, connectUser } from './controllers/authController.js';
import { insertTransaction, getTransactions } from './controllers/transactionController.js';

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign-up", registerUser);

app.post("/sign-in", connectUser);

app.post("/ios", insertTransaction);

app.get("/ios", getTransactions);

app.listen(port, () => {
    console.log(`Running on ${port}`);
});