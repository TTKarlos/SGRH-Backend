const express = require("express")
const empleadoController = require("../controllers/empleadoController")
const auth = require("../middlewares/auth")
const validateRequest = require("../utils/validateRequest")
const { createEmpleadoSchema, updateEmpleadoSchema, changeStatusSchema } = require("../validations/empleadoSchema")

class EmpleadoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, empleadoController.getAll)
        this.router.get("/count", auth, empleadoController.getCount)
        this.router.get("/:id", auth, empleadoController.getById)
        this.router.post("/", auth, validateRequest(createEmpleadoSchema), empleadoController.create)
        this.router.put("/:id", auth, validateRequest(updateEmpleadoSchema), empleadoController.update)
        this.router.delete("/:id", auth, empleadoController.delete)
        this.router.patch(
            "/:id/status",
            auth,
            validateRequest(changeStatusSchema),
            empleadoController.changeStatus,
        )
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new EmpleadoRepository()

