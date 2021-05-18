const Joi = require('joi');

const pamSessionSchemaValidate = (body)=>{
    const schema =  Joi.object({
        username: Joi.string()
        .min(3)
        .max(30)
        .required(),
        password: Joi.string().required()
    });

    return schema.validate(body);
}

module.exports = {
    pamSessionSchemaValidate
}