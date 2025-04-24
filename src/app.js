require("dotenv").config()
const checkUploadDirectory = require("./utils/checkUploadDir")
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const path = require("path")
const fs = require("fs-extra")
const helmet = require("helmet")
const corsOptions = require("./config/cors")
const config = require("./config")
const sequelize = require("../src/config/database")
const errorHandler = require("./middlewares/errorHandler")
const repositoryIndex = require("./routes/index")

const app = express()

app.use(helmet())

app.use(cors(corsOptions))

app.use(morgan("dev"))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const uploadsDir = path.join(__dirname, "uploads")
fs.ensureDirSync(uploadsDir)
fs.ensureDirSync(path.join(uploadsDir, "documentos"))
fs.ensureDirSync(path.join(uploadsDir, "documentos", "empleados"))

checkUploadDirectory()
    .then((isValid) => {
        if (!isValid) {
            console.warn("⚠️ La aplicación puede funcionar incorrectamente sin un directorio de uploads válido")
        }
    })
    .catch((err) => {
        console.error("Error al verificar directorio de uploads:", err)
    })

app.use("/api", repositoryIndex.getRoutes())

app.get("/", (req, res) => {
    res.json({
        name: "Sistema RRHH",
        description: "API para el sistema de gestión de recursos humanos",
        version: "1.0.0",
    })
})

app.use(errorHandler)

sequelize
    .authenticate()
    .then(() => {
        console.log("✅ Conexión a la base de datos exitosa")
        return sequelize.sync()
    })
    .then(() => console.log("✅ Base de datos sincronizada"))
    .catch((error) => console.error("❌ Error al conectar la base de datos:", error))

const PORT = config.app.port
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
