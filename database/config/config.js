require("dotenv").config()

module.exports = {
    development: {
        username: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "sistema_rrhh",
        host: process.env.MYSQL_HOST || "127.0.0.1",
        port: process.env.MYSQL_PORT || 1337,
        dialect: "mysql",
        logging: console.log,
    },
    test: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_TEST_DATABASE || "sistema_rrhh_test",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
        logging: false,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    },
}

