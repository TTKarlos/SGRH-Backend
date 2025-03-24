const { createResponse } = require("../utils/responseHelpers")

const errorHandler = (err, req, res, next) => {
    console.error("Error:", err)
    let statusCode = 500
    let message = "Error interno del servidor"
    let errors = null
    if (err.name === "AppError") {
        statusCode = err.statusCode || 500
        message = err.message
        errors = err.errors
    }
    else if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
        statusCode = 400
        message = "Error de validación"
        errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }))
    }
    else if (err.name === "JsonWebTokenError") {
        statusCode = 401
        message = "Token inválido"
    } else if (err.name === "TokenExpiredError") {
        statusCode = 401
        message = "Token expirado"
    }
    else if (err.code === "ECONNREFUSED") {
        message = "No se pudo conectar a la base de datos"
    }
    res.status(statusCode).json(createResponse(false, message, { errors }, statusCode))
}

module.exports = errorHandler

