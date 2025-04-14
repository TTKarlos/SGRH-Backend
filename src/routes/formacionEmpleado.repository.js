const express = require("express")
const formacionEmpleadoController = require("../controllers/formacionEmpleadoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
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
            isAdmin,
            validateRequest(createFormacionEmpleadoSchema),
            formacionEmpleadoController.create,
        )
        this.router.put(
            "/:id",
            auth,
            isAdmin,
            validateRequest(updateFormacionEmpleadoSchema),
            formacionEmpleadoController.update,
        )
        this.router.delete("/:id", auth, isAdmin, formacionEmpleadoController.delete)
        this.router.get("/empleado/:id_empleado", auth, formacionEmpleadoController.getByEmpleado)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new FormacionEmpleadoRepository()
