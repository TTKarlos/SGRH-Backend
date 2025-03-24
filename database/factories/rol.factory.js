const { faker } = require("@faker-js/faker/locale/es")
const { Rol } = require("../models")
const { ROLES } = require("../../src/utils/constants")

class RolFactory {

    static async create(overrides = {}) {
        const defaultRole = {
            nombre: faker.helpers.arrayElement(Object.values(ROLES)),
            descripcion: faker.lorem.sentence(),
        }

        const roleData = { ...defaultRole, ...overrides }

        return await Rol.create(roleData)
    }


    static async createMany(count, overrides = {}) {
        return Promise.all(Array.from({ length: count }, () => this.create(overrides)))
    }


    static async createSystemRoles() {
        const roles = Object.values(ROLES).map((roleName) => ({
            nombre: roleName,
            descripcion: `Rol de ${roleName.toLowerCase()}`,
        }))

        return Promise.all(
            roles.map((role) =>
                Rol.findOrCreate({
                    where: { nombre: role.nombre },
                    defaults: role,
                }).then(([instance]) => instance),
            ),
        )
    }
}

module.exports = RolFactory

