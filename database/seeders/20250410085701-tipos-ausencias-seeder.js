/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
        "tipos_ausencia",
        [
          {
            nombre: "Vacaciones",
          },
          {
            nombre: "Baja por enfermedad",
          },
          {
            nombre: "Permiso retribuido",
          },
          {
            nombre: "Permiso no retribuido",
          },
          {
            nombre: "Baja por maternidad/paternidad",
          },
          {
            nombre: "Asuntos propios",
          },
          {
            nombre: "Formación",
          },
          {
            nombre: "Otros",
          },
        ],
        {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tipos_ausencia", null, {})
  },
}
