/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const zonas = await queryInterface.sequelize.query("SELECT id_zona, nombre FROM zonas", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    })

    const zonaIds = {}
    zonas.forEach((zona) => {
      zonaIds[zona.nombre] = zona.id_zona
    })

    await queryInterface.bulkInsert(
        "centros",
        [
          {
            id_zona: zonaIds["Norte"],
            nombre: "Centro Empresarial Norte",
            direccion: "Calle Principal 123, Ciudad Norte",
            telefono: "912345678",
            email: "centro.norte@empresa.com",
          },
          {
            id_zona: zonaIds["Sur"],
            nombre: "Centro Empresarial Sur",
            direccion: "Avenida Principal 456, Ciudad Sur",
            telefono: "923456789",
            email: "centro.sur@empresa.com",
          },
          {
            id_zona: zonaIds["Este"],
            nombre: "Centro Empresarial Este",
            direccion: "Plaza Mayor 789, Ciudad Este",
            telefono: "934567890",
            email: "centro.este@empresa.com",
          },
          {
            id_zona: zonaIds["Oeste"],
            nombre: "Centro Empresarial Oeste",
            direccion: "Calle Secundaria 321, Ciudad Oeste",
            telefono: "945678901",
            email: "centro.oeste@empresa.com",
          },
          {
            id_zona: zonaIds["Centro"],
            nombre: "Sede Central",
            direccion: "Gran Vía 1, Ciudad Central",
            telefono: "956789012",
            email: "sede.central@empresa.com",
          },
        ],
        {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("centros", null, {})
  },
}

