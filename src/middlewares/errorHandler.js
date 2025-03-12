const AppError = require("../utils/appError")

module.exports = (err, req, res, next) => {
    console.error(err)

    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

    const isOperationalError = err instanceof AppError
    const isDevelopment = process.env.NODE_ENV === "development"

    const errorResponse = {
        status: err.status,
        message: err.message,
        errors: err.errors || null,
    }

    if (isDevelopment && err.statusCode >= 500) {
        errorResponse.stack = err.stack
    }

    res.status(err.statusCode).json(errorResponse)
}

