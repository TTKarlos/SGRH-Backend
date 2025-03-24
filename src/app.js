require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require("cors");
const corsOptions = require("./config/cors")
const config = require('./config');
const sequelize = require('../src/config/database');
const errorHandler = require('./middlewares/errorHandler');
const repositoryIndex = require('./routes/index');

const app = express();

app.use(cors(corsOptions))

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', repositoryIndex.getRoutes());
app.get("/", (req, res) => {
    res.json({
        name: "Sistema RRHH",
        description: "API para el sistema de gestión de recursos humanos",
        version: "1.0.0",
    })
})
app.use(errorHandler);

sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a la base de datos exitosa');
        return sequelize.sync();
    })
    .then(() => console.log('✅ Base de datos sincronizada'))
    .catch(error => console.error('❌ Error al conectar la base de datos:', error));

const PORT = config.app.port;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
