const { faker } = require("@faker-js/faker/locale/es")


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const departamentos = await queryInterface.sequelize.query(
        "SELECT id_departamento, id_centro, nombre FROM departamentos",
        { type: queryInterface.sequelize.QueryTypes.SELECT },
    )

    const centros = await queryInterface.sequelize.query("SELECT id_centro FROM centros", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    })

    const centroIds = centros.map((c) => c.id_centro)


    const empleados = []
    const numEmpleados = 100

    const generarDniNie = (index) => {
      const prefijos = ["", "X", "Y", "Z"]
      const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)]
      const numero = String(10000000 + index).padStart(8, "0")
      return `${prefijo}${numero}`
    }

    const estadosCiviles = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Otro"]

    for (let i = 0; i < numEmpleados; i++) {
      const departamento = departamentos[Math.floor(Math.random() * departamentos.length)]

      const fechaNacimiento = faker.date.past({
        years: 45,
        refDate: new Date(Date.now() - 20 * 365 * 24 * 60 * 60 * 1000),
      })

      const fechaIncorporacion = faker.date.past({ years: 20 })

      empleados.push({
        nombre: faker.person.firstName(),
        apellidos: `${faker.person.lastName()} ${faker.person.lastName()}`,
        fecha_nacimiento: fechaNacimiento,
        dni_nie: generarDniNie(i),
        direccion: faker.location.streetAddress(),
        telefono: faker.phone.number(),
        email: faker.internet.email(),
        estado_civil: estadosCiviles[Math.floor(Math.random() * estadosCiviles.length)],
        id_departamento: departamento.id_departamento,
        id_centro: departamento.id_centro,
        puesto_actual: faker.person.jobTitle(),
        fecha_incorporacion: fechaIncorporacion,
        activo: Math.random() > 0.1,
      })
    }

    await queryInterface.bulkInsert("empleados", empleados, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("empleados", null, {})
  },
}

