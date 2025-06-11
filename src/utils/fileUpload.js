const multer = require("multer")
const path = require("path")
const fs = require("fs-extra")
const AppError = require("./AppError")
const crypto = require("crypto")
require("dotenv").config()

const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/_{2,}/g, "_")
        .toLowerCase()
}

const getUploadPath = () => {
    const env = process.env.NODE_ENV || 'development'
    if (env === 'production') {
        return process.env.PROD_UPLOAD_PATH
    } else {
        return process.env.DEV_UPLOAD_PATH
    }
}

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const id_empleado = req.body.id_empleado || req.params.id_empleado

            if (!id_empleado) {
                return cb(new AppError("ID de empleado no proporcionado", 400))
            }

            const basePath = getUploadPath()
            const destPath = path.join(basePath, id_empleado.toString())

            await fs.ensureDir(destPath)

            cb(null, destPath)
        } catch (error) {
            console.error("Error al crear directorio:", error)
            cb(new AppError(`Error al crear directorio: ${error.message}`, 500))
        }
    },
    filename: (req, file, cb) => {
        const uniqueHash = crypto.randomBytes(8).toString("hex")

        const extension = path.extname(file.originalname)

        const sanitizedName = sanitizeFilename(path.basename(file.originalname, extension))

        const finalName = `${sanitizedName}-${uniqueHash}${extension}`

        cb(null, finalName)
    },
})

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
        "image/gif",
    ]

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new AppError("Tipo de archivo no permitido. Solo se permiten PDF, Word, Excel e imágenes.", 400), false)
    }
}

const limits = {
    fileSize: 10 * 1024 * 1024,
}

const upload = multer({
    storage,
    fileFilter,
    limits,
})

module.exports = upload