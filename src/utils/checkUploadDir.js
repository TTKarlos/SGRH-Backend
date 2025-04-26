const fs = require("fs-extra")
const path = require("path")

const getUploadPath = () => {
    const env = process.env.NODE_ENV || 'development'
    if (env === 'production') {
        return process.env.PROD_UPLOAD_PATH
    } else {
        return process.env.DEV_UPLOAD_PATH
    }
}

/**
 * Verifica que el directorio de uploads exista y tenga permisos correctos
 */
async function checkUploadDirectory() {
    const uploadPath = getUploadPath()

    try {
        await fs.ensureDir(uploadPath)

        await fs.access(uploadPath, fs.constants.W_OK)

        console.log(`✅ Directorio de uploads verificado: ${uploadPath}`)
        return true
    } catch (error) {
        console.error(`❌ Error con el directorio de uploads (${uploadPath}):`, error.message)
        console.error("Por favor, verifica que el directorio exista y tenga permisos de escritura")
        return false
    }
}

module.exports = checkUploadDirectory