require('dotenv').config();

module.exports = {
    app: {
        name: process.env.APP_NAME || 'ERP System',
        port: process.env.PORT || 3000,
    },
    database: {
        connection: process.env.MYSQL_CONNECTION || 'mysql',
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        database: process.env.MYSQL_DATABASE || 'erp_wholesale_db',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
    },
    auth: {
        adminPassword: process.env.ADMIN_PASSWORD || 'password',
        jwtSecret: process.env.JWT_SECRET || 'default-secret',
    },
};
