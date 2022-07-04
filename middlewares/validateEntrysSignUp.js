import { signUpSchema } from '../schemas/authShemas.js';

export function validateEntrysSignUp(req, res, next) {
    const validationBody = signUpSchema.validate(req.body);

    if (validationBody.error) {
        res.sendStatus(422);
        return;
    }

    next();
}