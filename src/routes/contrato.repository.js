const express = require("express")
const contratoController = require("../controllers/contratoController")
const auth = require("../middlewares/auth")
const upload = require("../utils/fileUpload")

class ContratoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        // Rutas GET (sin archivos) - orden específico para evitar conflictos
        this.router.get("/count", auth, contratoController.count)
        this.router.get("/proximos-a-vencer", auth, contratoController.getProximosAVencer)
        this.router.get("/empleado/:id_empleado", auth, contratoController.getByEmpleado)
        this.router.get("/download/:id", auth, contratoController.download)
        this.router.get("/preview/:id", auth, contratoController.preview)
        this.router.get("/", auth, contratoController.getAll)
        this.router.get("/:id", auth, contratoController.getById)

        // Rutas POST/PUT (con posibles archivos)
        this.router.post("/", auth, upload.single("archivo"), contratoController.create)
        this.router.put("/:id", auth, upload.single("archivo"), contratoController.update)
        this.router.put("/file/:id", auth, upload.single("archivo"), contratoController.updateWithFile)

        // Ruta DELETE
        this.router.delete("/:id", auth, contratoController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new ContratoRepository()
