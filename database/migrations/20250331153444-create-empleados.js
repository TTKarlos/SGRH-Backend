/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("empleados", {
      id_empleado: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      apellidos: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      dni_nie: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
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
      estado_civil: {
        type: Sequelize.ENUM("Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Otro"),
        allowNull: true,
      },
      id_departamento: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "departamentos",
          key: "id_departamento",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_centro: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "centros",
          key: "id_centro",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      puesto_actual: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      fecha_incorporacion: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("empleados")
  },
}

