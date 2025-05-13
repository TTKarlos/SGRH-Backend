'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categorias_convenio', {
      id_categoria: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_convenio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'convenios',
          key: 'id_convenio'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    await queryInterface.addIndex('categorias_convenio', ['id_convenio'], {
      name: 'idx_categorias_convenio_convenio'
    });

    await queryInterface.addIndex('categorias_convenio', ['nombre'], {
      name: 'idx_categorias_convenio_nombre'
    });

    await queryInterface.addIndex('categorias_convenio', ['id_convenio', 'nombre'], {
      name: 'idx_categorias_convenio_unique',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categorias_convenio');
  }
};