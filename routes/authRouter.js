import express from 'express';
import { registerUser, connectUser } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post("/sign-up", registerUser);
authRouter.post("/sign-in", connectUser);

export default authRouter;