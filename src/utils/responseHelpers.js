/**
 * Envía una respuesta exitosa
 * @param {Object} res - Response object
 * @param {*} data - Datos a enviar
 * @param {string} message - Mensaje de éxito
 * @param {number} statusCode - Código de estado HTTP
 */
const successResponse = (res, data = null, message = "Operación exitosa", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    })
}

/**
 * Envía una respuesta de error
 * @param {Object} res - Response object
 * @param {Error} error - Error object
 * @param {number} statusCode - Código de estado HTTP
 */
const errorResponse = (res, error, statusCode = 500) => {
    const message = error.message || "Error interno del servidor"
    const status = error.statusCode || statusCode

    return res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
}

/**
 * Crea un objeto de respuesta estándar (SIN statusCode para evitar conflictos)
 * @param {boolean} success - Si la operación fue exitosa
 * @param {string} message - Mensaje de la respuesta
 * @param {*} data - Datos de la respuesta
 */
const createResponse = (success, message, data = null) => {
    return {
        success,
        message,
        data,
    }
}

/**
 * Valida que los campos requeridos estén presentes
 * @param {Array} requiredFields - Array de nombres de campos requeridos
 * @param {Object} data - Objeto con los datos a validar
 * @throws {Error} Si faltan campos requeridos
 */
const validateFields = (requiredFields, data) => {
    const AppError = require("./AppError")
    const missingFields = []

    for (const field of requiredFields) {
        if (!data[field] || (typeof data[field] === "string" && data[field].trim() === "")) {
            missingFields.push(field)
        }
    }

    if (missingFields.length > 0) {
        const errors = missingFields.map((field) => ({
            field,
            message: `El campo ${field} es requerido`,
        }))

        throw new AppError(`Faltan campos requeridos: ${missingFields.join(", ")}`, 400, errors)
    }
}

/**
 * Wrapper para funciones async que maneja errores automáticamente
 * @param {Function} fn - Función async a envolver
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

/**
 * Construye un objeto con solo los campos permitidos para actualización
 * @param {Object} data - Datos de entrada
 * @param {Array} allowedFields - Campos permitidos
 * @returns {Object} Objeto con solo los campos permitidos
 */
const buildUpdateObject = (data, allowedFields) => {
    const updateData = {}

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field]
        }
    })

    return updateData
}

module.exports = {
    successResponse,
    errorResponse,
    createResponse,
    validateFields,
    asyncHandler,
    buildUpdateObject,
}
