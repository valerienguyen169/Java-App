"use strict";

const Joi = require('joi');

const {makeBodyValidator} = require("./makeValidation");

const userSchema = Joi.object({
    "password": Joi.string()
            .token()
            .lowercase()
            .required(),
    "username": Joi.string()
        .token()
        .lowercase()
        .required()
}); 

const userValidation = makeBodyValidator(userSchema);

module.exports = {
    userValidation,
}; 
