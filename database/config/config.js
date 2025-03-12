require('dotenv').config();

module.exports = {
development: {
username: process.env.MYSQL_USER,
password: process.env.MYSQL_PASSWORD,
database: process.env.MYSQL_DATABASE,
host: process.env.MYSQL_HOST,
port: process.env.MYSQL_PORT,
dialect: process.env.MYSQL_CONNECTION
},
test: {
username: process.env.MYSQL_USER,
password: process.env.MYSQL_PASSWORD,
database: process.env.MYSQL_DATABASE + '_test',
host: process.env.MYSQL_HOST,
port: process.env.MYSQL_PORT,
dialect: process.env.MYSQL_CONNECTION
},
production: {
username: process.env.MYSQL_USER,
password: process.env.MYSQL_PASSWORD,
database: process.env.MYSQL_DATABASE,
host: process.env.MYSQL_HOST,
port: process.env.MYSQL_PORT,
dialect: process.env.MYSQL_CONNECTION
}
};