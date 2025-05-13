'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('convenios', {
      id_convenio: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    await queryInterface.addIndex('convenios', ['nombre'], {
      name: 'idx_convenios_nombre'
    });

    await queryInterface.addIndex('convenios', ['codigo'], {
      name: 'idx_convenios_codigo'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('convenios');
  }
};