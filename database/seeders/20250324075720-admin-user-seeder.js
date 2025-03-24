const bcrypt = require("bcryptjs")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [adminRole] = await queryInterface.sequelize.query("SELECT id_rol FROM roles WHERE nombre = 'ADMIN';", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    })

    if (!adminRole) {
      throw new Error("Admin role not found. Run the roles seeder first.")
    }

    const password_hash = await bcrypt.hash("password", 12)

    await queryInterface.bulkInsert(
        "usuarios",
        [
          {
            nombre_usuario: "admin",
            password_hash,
            email: "admin@example.com",
            nombre: "Administrador",
            apellidos: "Sistema",
            id_rol: adminRole.id_rol,
            activo: true,
            token: null,
          },
        ],
        {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usuarios", { nombre_usuario: "admin" }, {})
  },
}

