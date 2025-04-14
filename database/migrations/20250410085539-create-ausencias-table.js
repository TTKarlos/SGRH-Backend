/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ausencias", {
      id_ausencia: {
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
      id_tipo_ausencia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tipos_ausencia",
          key: "id_tipo_ausencia",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fecha_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
    })

    await queryInterface.addIndex("ausencias", ["id_empleado", "fecha_inicio", "fecha_fin"], {
      name: "idx_empleado_fechas",
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ausencias")
  },
}
