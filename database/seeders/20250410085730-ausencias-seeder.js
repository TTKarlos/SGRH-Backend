/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const empleados = await queryInterface.sequelize.query("SELECT id_empleado FROM empleados LIMIT 5", {
      type: Sequelize.QueryTypes.SELECT,
    })

    if (empleados.length === 0) {
      console.log("No hay empleados para crear ausencias de ejemplo")
      return
    }

    const tiposAusencia = await queryInterface.sequelize.query("SELECT id_tipo_ausencia FROM tipos_ausencia", {
      type: Sequelize.QueryTypes.SELECT,
    })

    if (tiposAusencia.length === 0) {
      console.log("No hay tipos de ausencia para crear ausencias de ejemplo")
      return
    }

    const ausenciasData = []

    for (const empleado of empleados) {
      // Vacaciones de verano
      ausenciasData.push({
        id_empleado: empleado.id_empleado,
        id_tipo_ausencia:
            tiposAusencia.find((t) => t.nombre === "Vacaciones")?.id_tipo_ausencia || tiposAusencia[0].id_tipo_ausencia,
        fecha_inicio: "2023-08-01",
        fecha_fin: "2023-08-15",
      })

      // Baja por enfermedad
      ausenciasData.push({
        id_empleado: empleado.id_empleado,
        id_tipo_ausencia:
            tiposAusencia.find((t) => t.nombre === "Baja por enfermedad")?.id_tipo_ausencia ||
            tiposAusencia[1].id_tipo_ausencia,
        fecha_inicio: "2023-03-10",
        fecha_fin: "2023-03-15",
      })

      // Permiso retribuido
      ausenciasData.push({
        id_empleado: empleado.id_empleado,
        id_tipo_ausencia:
            tiposAusencia.find((t) => t.nombre === "Permiso retribuido")?.id_tipo_ausencia ||
            tiposAusencia[2].id_tipo_ausencia,
        fecha_inicio: "2023-05-02",
        fecha_fin: "2023-05-02",
      })
    }

    await queryInterface.bulkInsert("ausencias", ausenciasData, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ausencias", null, {})
  },
}
