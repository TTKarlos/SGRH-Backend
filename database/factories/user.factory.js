const bcrypt = require("bcryptjs")
const { faker } = require("@faker-js/faker/locale/es")
const { Usuario, Rol } = require("../models")
const { ROLES } = require("../../src/utils/constants")


class UsuarioFactory {

    static async create(overrides = {}) {
        let roles = await Rol.findAll()
        if (roles.length === 0) {
            roles = [
                await Rol.create({
                    nombre: "Administrador",
                    descripcion: "Administrador del sistema",
                }),
            ]
        }

        const randomRole = faker.helpers.arrayElement(roles)

        const defaultUser = {
            nombre_usuario: faker.internet.userName().substring(0, 50),
            password_hash: "password123",
            email: faker.internet.email().substring(0, 100),
            nombre: faker.person.firstName().substring(0, 50),
            apellidos: faker.person.lastName().substring(0, 100),
            id_rol: randomRole.id_rol,
            activo: faker.datatype.boolean({ probability: 0.9 }),
        }

        const userData = { ...defaultUser, ...overrides }

        return await Usuario.create(userData)
    }


    static async createMany(count, overrides = {}) {
        return Promise.all(Array.from({ length: count }, () => this.create(overrides)))
    }


    static async createAdmin(overrides = {}) {
        let adminRole = await Rol.findOne({ where: { nombre: "Administrador" } })
        if (!adminRole) {
            adminRole = await Rol.create({
                nombre: "Administrador",
                descripcion: "Administrador del sistema",
            })
        }

        return this.create({
            id_rol: adminRole.id_rol,
            ...overrides,
        })
    }


    static async createGerente(overrides = {}) {
        let gerenteRole = await Rol.findOne({ where: { nombre: "Gerente" } })
        if (!gerenteRole) {
            gerenteRole = await Rol.create({
                nombre: "Gerente",
                descripcion: "Gerente de departamento",
            })
        }

        return this.create({
            id_rol: gerenteRole.id_rol,
            ...overrides,
        })
    }

    static async createRRHH(overrides = {}) {
        let rrhhRole = await Rol.findOne({ where: { nombre: "RRHH" } })
        if (!rrhhRole) {
            rrhhRole = await Rol.create({
                nombre: "RRHH",
                descripcion: "Recursos Humanos",
            })
        }

        return this.create({
            id_rol: rrhhRole.id_rol,
            ...overrides,
        })
    }


    static async createInactive(overrides = {}) {
        return this.create({
            activo: false,
            ...overrides,
        })
    }
}

module.exports = UsuarioFactory

