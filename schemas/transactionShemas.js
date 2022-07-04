import joi from 'joi';

const tokenSchema = joi.string().required();

const ioSchema = joi.object({
    type: joi.string().valid('input', 'output').required(),
    value: joi.number().required(),
    description: joi.string().required()
});

export { tokenSchema, ioSchema };