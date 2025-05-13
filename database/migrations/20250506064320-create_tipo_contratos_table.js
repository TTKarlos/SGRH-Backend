'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tipos_contrato', {
      id_tipo_contrato: {
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
        type: Sequelize.STRING(20),
        allowNull: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    await queryInterface.addIndex('tipos_contrato', ['nombre'], {
      name: 'idx_tipos_contrato_nombre'
    });

    await queryInterface.addIndex('tipos_contrato', ['codigo'], {
      name: 'idx_tipos_contrato_codigo'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tipos_contrato');
  }
};