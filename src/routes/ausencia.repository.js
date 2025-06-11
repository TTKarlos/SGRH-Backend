const express = require("express")
const ausenciaController = require("../controllers/ausenciaController")
const auth = require("../middlewares/auth")
const validateRequest = require("../utils/validateRequest")
const { createAusenciaSchema, updateAusenciaSchema } = require("../validations/ausenciaSchema")

class AusenciaRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, ausenciaController.getAll)
        this.router.get("/:id", auth, ausenciaController.getById)
        this.router.post("/", auth, validateRequest(createAusenciaSchema), ausenciaController.create)
        this.router.put("/:id", auth, validateRequest(updateAusenciaSchema), ausenciaController.update)
        this.router.delete("/:id", auth, ausenciaController.delete)
        this.router.get("/empleado/:id_empleado", auth, ausenciaController.getByEmpleado)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new AusenciaRepository()
