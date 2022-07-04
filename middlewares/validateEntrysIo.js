import { ioSchema } from '../schemas/transactionShemas.js';

export function validadeEntrysIo(req, res, next) {
    const validationBody = ioSchema.validate(req.body);

    if (validationBody.error) {
        res.sendStatus(422);
        return;
    }

    next();
}