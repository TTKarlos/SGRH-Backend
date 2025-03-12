const bcrypt = require("bcryptjs")
const { faker } = require("@faker-js/faker")
const { ROLES } = require("../../src/utils/constants")

class UserFactory {
    static async create(overrides = {}) {
        const defaultPassword = await bcrypt.hash("password", 8)

        const defaultUser = {
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: defaultPassword,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            role: faker.helpers.arrayElement(Object.values(ROLES)),
            isActive: faker.datatype.boolean({ probability: 0.8 }),
            image: null,
            token: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        return { ...defaultUser, ...overrides }
    }

    static async createMany(count, overrides = {}) {
        return Promise.all(Array.from({ length: count }, () => this.create(overrides)))
    }
}

module.exports = UserFactory

