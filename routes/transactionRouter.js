import express from 'express';
import { insertTransaction, getTransactions } from '../controllers/transactionController.js';

const transactionRouter = express.Router();

transactionRouter.post("/ios", insertTransaction);
transactionRouter.get("/ios", getTransactions);

export default transactionRouter;