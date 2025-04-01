/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
        "zonas",
        [
          {
            nombre: "Norte",
            descripcion: "Zona norte del país",
          },
          {
            nombre: "Sur",
            descripcion: "Zona sur del país",
          },
          {
            nombre: "Este",
            descripcion: "Zona este del país",
          },
          {
            nombre: "Oeste",
            descripcion: "Zona oeste del país",
          },
          {
            nombre: "Centro",
            descripcion: "Zona centro del país",
          },
        ],
        {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("zonas", null, {})
  },
}

