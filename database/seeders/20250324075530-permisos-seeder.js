/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert(
        "permisos",
        [
          {
            nombre: "Usuarios",
            tipo: "Lectura",
            descripcion: "Ver usuarios",
          },
          {
            nombre: "Usuarios",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar usuarios",
          },
          {
            nombre: "Empleados",
            tipo: "Lectura",
            descripcion: "Ver empleados",
          },
          {
            nombre: "Empleados",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar empleados",
          },
          {
            nombre: "Contratos",
            tipo: "Lectura",
            descripcion: "Ver contratos",
          },
          {
            nombre: "Contratos",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar contratos",
          },
          {
            nombre: "Documentos",
            tipo: "Lectura",
            descripcion: "Ver documentos",
          },
          {
            nombre: "Documentos",
            tipo: "Escritura",
            descripcion: "Subir, editar y eliminar documentos",
          },
          {
            nombre: "Ausencias",
            tipo: "Lectura",
            descripcion: "Ver ausencias",
          },
          {
            nombre: "Ausencias",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar ausencias",
          },
          {
            nombre: "Notificaciones",
            tipo: "Lectura",
            descripcion: "Ver notificaciones",
          },
          {
            nombre: "Notificaciones",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar notificaciones",
          },
        ],
        {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permisos", null, {})
  },
}

