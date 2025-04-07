const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: 'mysql',
        logging: process.env.NODE_ENV !== 'production',
        dialectOptions: process.env.NODE_ENV === 'production' ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            }
        } : {}
    }
);

module.exports = sequelize;