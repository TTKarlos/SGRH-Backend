/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("documentos", {
      id_documento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_empleado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "empleados",
          key: "id_empleado",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ruta_archivo: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      nombre_original: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tamano: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      fecha_subida: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    })

    await queryInterface.addIndex("documentos", ["id_empleado"], {
      name: "idx_documentos_empleado",
    })

    await queryInterface.addIndex("documentos", ["fecha_subida"], {
      name: "idx_documentos_fecha",
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("documentos")
  },
}
