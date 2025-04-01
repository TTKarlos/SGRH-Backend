/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("centros", {
      id_centro: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_zona: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "zonas",
          key: "id_zona",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("centros")
  },
}

