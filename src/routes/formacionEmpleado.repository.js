const express = require("express")
const formacionEmpleadoController = require("../controllers/formacionEmpleadoController")
const auth = require("../middlewares/auth")
const validateRequest = require("../utils/validateRequest")
const { createFormacionEmpleadoSchema, updateFormacionEmpleadoSchema } = require("../validations/formacionEmpleadoSchema")

class FormacionEmpleadoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, formacionEmpleadoController.getAll)
        this.router.get("/:id", auth, formacionEmpleadoController.getById)
        this.router.post(
            "/",
            auth,
            validateRequest(createFormacionEmpleadoSchema),
            formacionEmpleadoController.create,
        )
        this.router.put(
            "/:id",
            auth,
            validateRequest(updateFormacionEmpleadoSchema),
            formacionEmpleadoController.update,
        )
        this.router.delete("/:id", auth, formacionEmpleadoController.delete)
        this.router.get("/empleado/:id_empleado", auth, formacionEmpleadoController.getByEmpleado)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new FormacionEmpleadoRepository()
