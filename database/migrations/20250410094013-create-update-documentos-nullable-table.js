/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables()
    if (!tables.includes("documentos")) {
      console.log("La tabla documentos no existe, omitiendo migración")
      return
    }

    await queryInterface.changeColumn("documentos", "ruta_archivo", {
      type: Sequelize.STRING(500),
      allowNull: true,
    })

    await queryInterface.changeColumn("documentos", "nombre_original", {
      type: Sequelize.STRING(255),
      allowNull: true,
    })

    await queryInterface.changeColumn("documentos", "mimetype", {
      type: Sequelize.STRING(100),
      allowNull: true,
    })

    await queryInterface.changeColumn("documentos", "tamano", {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    await queryInterface
        .addIndex("documentos", ["id_empleado"], {
          name: "idx_documentos_empleado",
          unique: false,
        })
        .catch((err) => {
          console.log("Índice idx_documentos_empleado ya existe o no se pudo crear")
        })

    await queryInterface
        .addIndex("documentos", ["tipo_documento"], {
          name: "idx_documentos_tipo",
          unique: false,
        })
        .catch((err) => {
          console.log("Índice idx_documentos_tipo ya existe o no se pudo crear")
        })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("documentos", "ruta_archivo", {
      type: Sequelize.STRING(500),
      allowNull: false,
    })

    await queryInterface.changeColumn("documentos", "nombre_original", {
      type: Sequelize.STRING(255),
      allowNull: false,
    })

    await queryInterface.changeColumn("documentos", "mimetype", {
      type: Sequelize.STRING(100),
      allowNull: false,
    })

    await queryInterface.changeColumn("documentos", "tamano", {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
  },
}
