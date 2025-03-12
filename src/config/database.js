const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
    config.database.database,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: 'mysql',
        logging: false,           
    }
);

module.exports = sequelize;
