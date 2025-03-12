class AppError extends Error {
    constructor(message, statusCode = 500, errors = null) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"
        this.isOperational = true
        this.errors = errors

        this.timestamp = new Date().toISOString()
        this.path = null // Se puede establecer más tarde
        this.method = null // Se puede establecer más tarde

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor)
        }
    }

    setRequestInfo(req) {
        this.path = req.path
        this.method = req.method
        return this
    }

    toJSON() {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            timestamp: this.timestamp,
            path: this.path,
            method: this.method,
            stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
        }
    }
}

module.exports = AppError

