const path = require("path")
const fs = require("fs-extra")
require("dotenv").config()

const getUploadPath = () => {
  const env = process.env.NODE_ENV || 'development'
  if (env === 'production') {
    return process.env.PROD_UPLOAD_PATH
  } else {
    return process.env.DEV_UPLOAD_PATH
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    if (process.env.NODE_ENV === "production") {
      return
    }

    const documentos = await queryInterface.sequelize.query(
        "SELECT id_documento, id_empleado, nombre, nombre_original, mimetype FROM documentos",
        {
          type: Sequelize.QueryTypes.SELECT,
        },
    )

    if (documentos.length === 0) {
      return
    }

    const uploadsDir = getUploadPath()
    await fs.ensureDir(uploadsDir)

    const pdfContent =
        "%PDF-1.5\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 500 800] /Contents 6 0 R >>\nendobj\n4 0 obj\n<< /Font << /F1 5 0 R >> >>\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n6 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Documento de ejemplo) Tj ET\nendstream\nendobj\nxref\n0 7\n0000000000 65535 f\n0000000010 00000 n\n0000000059 00000 n\n0000000118 00000 n\n0000000217 00000 n\n0000000262 00000 n\n0000000329 00000 n\ntrailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n427\n%%EOF"
    const jpgHeader = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00,
      0x00,
    ])
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    ])

    let filesCreated = 0

    for (const documento of documentos) {
      const empleadoDir = path.join(uploadsDir, documento.id_empleado.toString())
      await fs.ensureDir(empleadoDir)

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      const extension = path.extname(documento.nombre_original)
      const fileName = `${path.basename(documento.nombre_original, extension)}-${uniqueSuffix}${extension}`
      const filePath = path.join(empleadoDir, fileName)

      try {
        if (documento.mimetype === "application/pdf") {
          await fs.writeFile(filePath, pdfContent)
        } else if (documento.mimetype === "image/jpeg") {
          const buffer = Buffer.concat([jpgHeader, Buffer.alloc(100, 0)])
          await fs.writeFile(filePath, buffer)
        } else if (documento.mimetype === "image/png") {
          const buffer = Buffer.concat([pngHeader, Buffer.alloc(100, 0)])
          await fs.writeFile(filePath, buffer)
        } else {
          await fs.writeFile(filePath, `Contenido de ejemplo para ${documento.nombre}`)
        }

        await queryInterface.sequelize.query(
            `UPDATE documentos SET ruta_archivo = ?, tamano = ? WHERE id_documento = ?`,
            {
              replacements: [filePath, (await fs.stat(filePath)).size, documento.id_documento],
              type: Sequelize.QueryTypes.UPDATE,
            },
        )

        filesCreated++
      } catch (error) {
        console.error(`Error al crear archivo para documento ${documento.id_documento}:`, error)
      }
    }

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`UPDATE documentos SET ruta_archivo = NULL, tamano = 0`, {
      type: Sequelize.QueryTypes.UPDATE,
    })
  },
}