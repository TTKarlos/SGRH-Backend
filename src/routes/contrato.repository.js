const express = require("express")
const contratoController = require("../controllers/contratoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const { createContratoSchema, updateContratoSchema } = require("../validations/contratoSchema")
const upload = require("../utils/fileUpload")

class ContratoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/empleado/:id_empleado", auth, contratoController.getByEmpleado)
        this.router.get("/download/:id", auth, contratoController.download)
        this.router.get("/preview/:id", auth, contratoController.preview)

        this.router.post("/upload/:id", auth, isAdmin, upload.single("archivo"), contratoController.upload)

        this.router.get("/", auth, contratoController.getAll)
        this.router.get("/:id", auth, contratoController.getById)
        this.router.post("/", auth, isAdmin, validateRequest(createContratoSchema), contratoController.create)
        this.router.put("/:id", auth, isAdmin, validateRequest(updateContratoSchema), contratoController.update)
        this.router.delete("/:id", auth, isAdmin, contratoController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new ContratoRepository()