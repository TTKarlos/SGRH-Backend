require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
    development: {
        username: process.env.DEV_MYSQL_USER || "root",
        password: process.env.DEV_MYSQL_PASSWORD || "",
        database: process.env.DEV_MYSQL_DATABASE || "sistema_rrhh",
        host: process.env.DEV_MYSQL_HOST || "127.0.0.1",
        port: process.env.DEV_MYSQL_PORT || 9001,
        dialect: "mysql",
        logging: console.log,
    },
    test: {
        username: process.env.DEV_MYSQL_USER || "root",
        password: process.env.DEV_MYSQL_PASSWORD || "",
        database: process.env.DEV_MYSQL_DATABASE + "_test" || "sistema_rrhh_test",
        host: process.env.DEV_MYSQL_HOST || "127.0.0.1",
        port: process.env.DEV_MYSQL_PORT || 9001,
        dialect: "mysql",
        logging: false,
    },
    production: {
        username: process.env.PROD_MYSQL_USER || "root",
        password: process.env.PROD_MYSQL_PASSWORD || "",
        database: process.env.PROD_MYSQL_DATABASE || "sistema_rrhh",
        host: process.env.PROD_MYSQL_HOST || "127.0.0.1",
        port: process.env.PROD_MYSQL_PORT || 3306,
        dialect: "mysql",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    }
};