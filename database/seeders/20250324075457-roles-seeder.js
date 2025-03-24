/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert(
        "roles",
        [
          {
            nombre: "ADMIN",
            descripcion: "Administrador del sistema con acceso completo",
          },
          {
            nombre: "GERENTE",
            descripcion: "Gerente con acceso a la mayoría de las funciones",
          },
          {
            nombre: "RRHH",
            descripcion: "Personal de recursos humanos",
          },
          {
            nombre: "USUARIO",
            descripcion: "Usuario regular con acceso limitado",
          },
        ],
        {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {})
  },
}

