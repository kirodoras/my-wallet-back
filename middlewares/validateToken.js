import { tokenSchema } from '../schemas/transactionShemas.js';

export function validateToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    const validationToken = tokenSchema.validate(token);

    if (validationToken.error) {
        res.sendStatus(422);
        return;
    }

    res.locals.token = token;
    next();
}