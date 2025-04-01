/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const centros = await queryInterface.sequelize.query("SELECT id_centro, nombre FROM centros", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    })

    const centroIds = {}
    centros.forEach((centro) => {
      centroIds[centro.nombre] = centro.id_centro
    })

    const departamentos = []

    const departamentosNombres = [
      "Recursos Humanos",
      "Finanzas",
      "Marketing",
      "Ventas",
      "Tecnología",
      "Operaciones",
      "Atención al Cliente",
    ]

    Object.keys(centroIds).forEach((centroNombre) => {
      const numDepartamentos = Math.floor(Math.random() * departamentosNombres.length) + 3 // Al menos 3 departamentos
      const departamentosSeleccionados = [...departamentosNombres]
          .sort(() => 0.5 - Math.random())
          .slice(0, numDepartamentos)

      departamentosSeleccionados.forEach((deptoNombre) => {
        departamentos.push({
          id_centro: centroIds[centroNombre],
          nombre: deptoNombre,
          descripcion: `Departamento de ${deptoNombre} en ${centroNombre}`,
        })
      })
    })

    await queryInterface.bulkInsert("departamentos", departamentos, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("departamentos", null, {})
  },
}

