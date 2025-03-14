const bcrypt = require("bcryptjs")
require("dotenv").config()
const { ROLES } = require("../../src/utils/constants")
const UserFactory = require("../factories/user.factory")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 8)

    await queryInterface.bulkInsert(
        "Users",
        [
          {
            username: "admin",
            email: "admin@example.com",
            password: hashedPassword,
            firstName: "Super",
            lastName: "Admin",
            image: null,
            role: ROLES.SUPERADMIN,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {
          updateOnDuplicate: ["email", "password", "firstName", "lastName", "role", "isActive", "updatedAt"],
        },
    )

    const additionalUsers = await UserFactory.createMany(5)

    for (const user of additionalUsers) {
      await queryInterface.bulkInsert("Users", [user], {
        ignoreDuplicates: true,
      })
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Users", { username: { [Sequelize.Op.ne]: "admin" } })
  },
}

