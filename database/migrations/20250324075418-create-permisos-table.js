/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("permisos", {
      id_permiso: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("Lectura", "Escritura"),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    })

    await queryInterface.createTable("permisos_rol", {
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "roles",
          key: "id_rol",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_permiso: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "permisos",
          key: "id_permiso",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    })

    await queryInterface.addIndex("permisos_rol", ["id_rol"])
    await queryInterface.addIndex("permisos_rol", ["id_permiso"])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("permisos_rol")
    await queryInterface.dropTable("permisos")
  },
}

