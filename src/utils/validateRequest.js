const AppError = require("./AppError")

/**
 * Middleware para validar una solicitud usando un esquema Yup
 * @param {Object} schema - Esquema Yup para validar
 * @param {string} source - Fuente de los datos a validar ('body', 'query', 'params')
 * @returns {Function} Middleware de Express
 */
const validateRequest = (schema, source = "body") => {
    return async (req, res, next) => {
        try {
            const data = req[source]
            const validatedData = await schema.validate(data, {
                abortEarly: false,
                stripUnknown: true,
            })

            req[source] = validatedData
            next()
        } catch (error) {
            const errors = error.inner.map((err) => ({
                field: err.path,
                message: err.message,
            }))

            next(new AppError("Error de validación", 400, errors))
        }
    }
}

module.exports = validateRequest

