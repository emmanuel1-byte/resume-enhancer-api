const logger = require('../utils/logger');
const Joi = require('joi');
const respond = require('../utils/respond');

function globalErrorHandler(err, req, res, next) {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
    if (err instanceof Joi.ValidationError) {
        return respond(res, 400, err.message);
    }
    return respond(res, statusCode, "Internal Server Error");
}

function routeNotFound(req, res, next) {
    return respond(res, 404, "Endpoint does not exist on this server")
}

module.exports = {
    globalErrorHandler,
    routeNotFound
}