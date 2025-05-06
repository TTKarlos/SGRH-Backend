const path = require("path")
const fs = require("fs-extra")
require("dotenv").config()

const getUploadPath = () => {
  const env = process.env.NODE_ENV || 'development'
  if (env === 'production') {
    return process.env.PROD_UPLOAD_PATH || '/var/www/sgrh/documentos/empleados'
  } else {
    return process.env.DEV_UPLOAD_PATH || path.join(__dirname, "../uploads/documentos/empleados")
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const empleados = await queryInterface.sequelize.query("SELECT id_empleado FROM empleados", {
      type: Sequelize.QueryTypes.SELECT,
    })

    if (empleados.length === 0) {
      console.log("No hay empleados para crear documentos de ejemplo")
      return
    }

    const documentosData = []
    const fechaActual = new Date()

    const uploadsDir = getUploadPath()
    await fs.ensureDir(uploadsDir)

    for (const empleado of empleados) {
      const empleadoDir = path.join(uploadsDir, empleado.id_empleado.toString())
      await fs.ensureDir(empleadoDir)

      documentosData.push({
        id_empleado: empleado.id_empleado,
        nombre: `Contrato de trabajo`,
        ruta_archivo: null,
        nombre_original: `Contrato_${empleado.id_empleado}.pdf`,
        mimetype: "application/pdf",
        tamano: 0,
        fecha_subida: new Date(fechaActual.getTime() - 180 * 24 * 60 * 60 * 1000),
        observaciones: "Contrato inicial",
      })

      documentosData.push({
        id_empleado: empleado.id_empleado,
        nombre: `Curriculum Vitae`,
        ruta_archivo: null,
        nombre_original: `CV_${empleado.id_empleado}.pdf`,
        mimetype: "application/pdf",
        tamano: 0,
        fecha_subida: new Date(fechaActual.getTime() - 190 * 24 * 60 * 60 * 1000),
        observaciones: "Curriculum Vitae actualizado",
      })

      documentosData.push({
        id_empleado: empleado.id_empleado,
        nombre: `Documento de identidad`,
        ruta_archivo: null,
        nombre_original: `DNI_${empleado.id_empleado}.jpg`,
        mimetype: "image/jpeg",
        tamano: 0,
        fecha_subida: new Date(fechaActual.getTime() - 185 * 24 * 60 * 60 * 1000),
        observaciones: "Documento de identidad",
      })

      const documentosAdicionales = [
        "Título académico",
        "Certificado de formación",
        "Nómina",
        "Evaluación de desempeño",
        "Documento adicional"
      ]

      const numDocumentosAdicionales = 1 + Math.floor(Math.random() * 3)

      for (let i = 0; i < numDocumentosAdicionales; i++) {
        const docIndex = Math.floor(Math.random() * documentosAdicionales.length)
        const diasAtras = Math.floor(Math.random() * 150)
        const nombreDoc = documentosAdicionales[docIndex]

        documentosData.push({
          id_empleado: empleado.id_empleado,
          nombre: nombreDoc,
          ruta_archivo: null,
          nombre_original: `${nombreDoc.replace(/\s+/g, "_")}_${empleado.id_empleado}_${i}.pdf`,
          mimetype: "application/pdf",
          tamano: 0,
          fecha_subida: new Date(fechaActual.getTime() - diasAtras * 24 * 60 * 60 * 1000),
          observaciones: `Documento: ${nombreDoc}`,
        })
      }
    }

    await queryInterface.bulkInsert("documentos", documentosData, {})
    console.log(`✅ Insertados ${documentosData.length} documentos de ejemplo`)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("documentos", null, {})
  },
}