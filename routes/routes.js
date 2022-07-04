import express from 'express';
import authRouter from './authRouter.js';
import transactionRouter from './transactionRouter.js';

const router = express.Router();
router.use(authRouter);
router.use(transactionRouter);
export default router;