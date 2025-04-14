/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const empleados = await queryInterface.sequelize.query("SELECT id_empleado FROM empleados LIMIT 5", {
      type: Sequelize.QueryTypes.SELECT,
    })

    if (empleados.length === 0) {
      console.log("No hay empleados para crear formaciones de ejemplo")
      return
    }

    const formacionesData = []

    const formaciones = [
      {
        nombre: "Curso de Excel Avanzado",
        es_interna: true,
        fecha_inicio: "2023-02-15",
        fecha_fin: "2023-03-15",
      },
      {
        nombre: "Formación en Prevención de Riesgos Laborales",
        es_interna: true,
        fecha_inicio: "2023-04-10",
        fecha_fin: "2023-04-12",
      },
      {
        nombre: "Máster en Dirección de Recursos Humanos",
        es_interna: false,
        fecha_inicio: "2022-09-01",
        fecha_fin: "2023-06-30",
      },
      {
        nombre: "Curso de Gestión del Tiempo",
        es_interna: true,
        fecha_inicio: "2023-05-20",
        fecha_fin: "2023-05-21",
      },
      {
        nombre: "Certificación en Project Management",
        es_interna: false,
        fecha_inicio: "2023-01-10",
        fecha_fin: "2023-06-10",
      },
    ]

    for (let i = 0; i < empleados.length; i++) {
      const numFormaciones = 2 + Math.floor(Math.random() * 2)

      for (let j = 0; j < numFormaciones; j++) {
        const formacionIndex = (i + j) % formaciones.length
        formacionesData.push({
          id_empleado: empleados[i].id_empleado,
          ...formaciones[formacionIndex],
        })
      }
    }

    await queryInterface.bulkInsert("formacion_empleado", formacionesData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("formacion_empleado", null, {})
  },
}
