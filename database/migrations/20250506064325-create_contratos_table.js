'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contratos', {
      id_contrato: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_empleado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empleados',
          key: 'id_empleado'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_tipo_contrato: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tipos_contrato',
          key: 'id_tipo_contrato'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_empresa: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresas',
          key: 'id_empresa'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_convenio: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'convenios',
          key: 'id_convenio'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categorias_convenio',
          key: 'id_categoria'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_fin: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      fin_periodo_prueba: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      antiguedad_contrato: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ruta_archivo: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      nombre_original: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tamano: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    });

    await queryInterface.addIndex('contratos', ['id_empleado'], {
      name: 'idx_contratos_empleado'
    });
    await queryInterface.addIndex('contratos', ['id_tipo_contrato'], {
      name: 'idx_contratos_tipo_contrato'
    });
    await queryInterface.addIndex('contratos', ['id_empresa'], {
      name: 'idx_contratos_empresa'
    });
    await queryInterface.addIndex('contratos', ['id_convenio'], {
      name: 'idx_contratos_convenio'
    });
    await queryInterface.addIndex('contratos', ['fecha_inicio'], {
      name: 'idx_contratos_fecha_inicio'
    });
    await queryInterface.addIndex('contratos', ['fecha_fin'], {
      name: 'idx_contratos_fecha_fin'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contratos');
  }
};