import express from 'express';
import { registerUser, connectUser } from '../controllers/authController.js';
import { validateEntrysSignUp } from '../middlewares/validateEntrysSignUp.js';
import { validateEntrysSignIn } from '../middlewares/validateEntrysSignIn.js';

const authRouter = express.Router();

authRouter.post("/sign-up", validateEntrysSignUp, registerUser);
authRouter.post("/sign-in", validateEntrysSignIn, connectUser);

export default authRouter;