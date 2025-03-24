/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert(
        "permisos",
        [
          {
            nombre: "usuarios",
            tipo: "Lectura",
            descripcion: "Ver usuarios",
          },
          {
            nombre: "usuarios",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar usuarios",
          },
          {
            nombre: "empleados",
            tipo: "Lectura",
            descripcion: "Ver empleados",
          },
          {
            nombre: "empleados",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar empleados",
          },
          {
            nombre: "contratos",
            tipo: "Lectura",
            descripcion: "Ver contratos",
          },
          {
            nombre: "contratos",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar contratos",
          },
          {
            nombre: "documentos",
            tipo: "Lectura",
            descripcion: "Ver documentos",
          },
          {
            nombre: "documentos",
            tipo: "Escritura",
            descripcion: "Subir, editar y eliminar documentos",
          },
          {
            nombre: "ausencias",
            tipo: "Lectura",
            descripcion: "Ver ausencias",
          },
          {
            nombre: "ausencias",
            tipo: "Escritura",
            descripcion: "Crear, editar y eliminar ausencias",
          },
          {
            nombre: "notificaciones",
            tipo: "Lectura",
            descripcion: "Ver notificaciones",
          },
          {
            nombre: "notificaciones",
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

