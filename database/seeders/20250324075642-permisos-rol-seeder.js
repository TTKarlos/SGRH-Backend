/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query("SELECT id_rol, nombre FROM roles;", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    })

    const roleIds = {}
    roles.forEach((role) => {
      roleIds[role.nombre] = role.id_rol
    })

    const permisos = await queryInterface.sequelize.query("SELECT id_permiso, nombre, tipo FROM permisos;", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    })

    const permisoIds = {}
    permisos.forEach((permiso) => {
      const key = `${permiso.nombre}_${permiso.tipo}`
      permisoIds[key] = permiso.id_permiso
    })

    const permisosRol = []

    Object.values(permisoIds).forEach((id_permiso) => {
      permisosRol.push({
        id_rol: roleIds.ADMIN,
        id_permiso,
      })
    })

    ;[
      "usuarios_Lectura",
      "empleados_Lectura",
      "empleados_Escritura",
      "contratos_Lectura",
      "contratos_Escritura",
      "documentos_Lectura",
      "documentos_Escritura",
      "ausencias_Lectura",
      "ausencias_Escritura",
      "notificaciones_Lectura",
    ].forEach((key) => {
      if (permisoIds[key]) {
        permisosRol.push({
          id_rol: roleIds.GERENTE,
          id_permiso: permisoIds[key],
        })
      }
    })

    ;[
      "usuarios_Lectura",
      "empleados_Lectura",
      "empleados_Escritura",
      "contratos_Lectura",
      "contratos_Escritura",
      "documentos_Lectura",
      "documentos_Escritura",
      "ausencias_Lectura",
      "ausencias_Escritura",
    ].forEach((key) => {
      if (permisoIds[key]) {
        permisosRol.push({
          id_rol: roleIds.RRHH,
          id_permiso: permisoIds[key],
        })
      }
    })

    ;["empleados_Lectura", "documentos_Lectura", "ausencias_Lectura", "notificaciones_Lectura"].forEach((key) => {
      if (permisoIds[key]) {
        permisosRol.push({
          id_rol: roleIds.USUARIO,
          id_permiso: permisoIds[key],
        })
      }
    })

    await queryInterface.bulkInsert("permisos_rol", permisosRol, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permisos_rol", null, {})
  },
}

