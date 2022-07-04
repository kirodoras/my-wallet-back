import express from 'express';
import { insertTransaction, getTransactions } from '../controllers/transactionController.js';
import { validateToken } from '../middlewares/validateToken.js';
import { validadeEntrysIo } from '../middlewares/validateEntrysIo.js';

const transactionRouter = express.Router();

transactionRouter.post("/ios", validateToken, validadeEntrysIo, insertTransaction);
transactionRouter.get("/ios", validateToken, getTransactions);

export default transactionRouter;