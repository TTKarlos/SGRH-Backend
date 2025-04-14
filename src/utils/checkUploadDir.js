const fs = require("fs-extra")
const path = require("path")

/**
 * Verifica que el directorio de uploads exista y tenga permisos correctos
 */
async function checkUploadDirectory() {
    const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, "../uploads")

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
