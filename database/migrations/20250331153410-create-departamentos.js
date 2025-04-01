/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("departamentos", {
      id_departamento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_centro: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "centros",
          key: "id_centro",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("departamentos")
  },
}

