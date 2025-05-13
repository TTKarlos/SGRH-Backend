'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresas', {
      id_empresa: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      cif: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });

    await queryInterface.addIndex('empresas', ['nombre'], {
      name: 'idx_empresas_nombre'
    });

    await queryInterface.addIndex('empresas', ['cif'], {
      name: 'idx_empresas_cif'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empresas');
  }
};