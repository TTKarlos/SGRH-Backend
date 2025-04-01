/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("zonas", {
      id_zona: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
    await queryInterface.dropTable("zonas")
  },
}

