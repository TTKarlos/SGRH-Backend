
const createResponse = (success, message, data = {}, statusCode = 200) => {
    return {
        success,
        message,
        data,
        statusCode,
    }
}


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


const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

module.exports = {
    createResponse,
    validateFields,
    asyncHandler,
}

