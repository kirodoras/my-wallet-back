import { signInSchema } from '../schemas/authShemas.js';

export function validateEntrysSignIn(req, res, next) {
    const validationBody = signInSchema.validate(req.body);

    if (validationBody.error) {
        res.sendStatus(422);
        return;
    }

    next();
}