const createResponse = (success, message, data = null, statusCode = 200) => ({
    success,
    message,
    data,
    statusCode,
})

const validateFields = (fields, data) => {
    const missingFields = []

    for (const field of fields) {
        if (data[field] === undefined || data[field] === null || data[field] === "") {
            missingFields.push(field)
        }
    }

    if (missingFields.length > 0) {
        const AppError = require("./AppError")
        throw new AppError(
            `Los siguientes campos son requeridos: ${missingFields.join(", ")}`,
            400,
            missingFields.map((field) => ({ field, message: "Este campo es requerido" })),
        )
    }
}

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = {
    createResponse,
    validateFields,
    asyncHandler,
}

