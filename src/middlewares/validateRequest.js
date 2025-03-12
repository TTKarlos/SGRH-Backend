const AppError = require("../utils/appError")

const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const errors = error.inner.reduce((acc, err) => {
            acc[err.path] = err.message
            return acc
        }, {})
        next(new AppError("Validation error", 400, errors))
    }
}

module.exports = validateRequest

