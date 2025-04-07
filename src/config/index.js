require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const config = {
    app: {
        name: process.env.APP_NAME || "Backend RRHH",
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || "development",
    },
    database: {
        connection: isProduction ? process.env.PROD_MYSQL_CONNECTION : process.env.DEV_MYSQL_CONNECTION,
        host: isProduction ? process.env.PROD_MYSQL_HOST : process.env.DEV_MYSQL_HOST,
        port: isProduction ? process.env.PROD_MYSQL_PORT : process.env.DEV_MYSQL_PORT,
        database: isProduction ? process.env.PROD_MYSQL_DATABASE : process.env.DEV_MYSQL_DATABASE,
        username: isProduction ? process.env.PROD_MYSQL_USER : process.env.DEV_MYSQL_USER,
        password: isProduction ? process.env.PROD_MYSQL_PASSWORD : process.env.DEV_MYSQL_PASSWORD,
    },
    admin: {
        password: isProduction ? process.env.PROD_ADMIN_PASSWORD : process.env.DEV_ADMIN_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
    cors: {
        origin: isProduction ? process.env.PROD_CORS_ORIGIN : process.env.DEV_CORS_ORIGIN,
    },
};

module.exports = config;