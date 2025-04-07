const express = require("express")
const departamentoController = require("../controllers/departamentoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const {
    createDepartamentoSchema,
    updateDepartamentoSchema,
    changeStatusSchema,
} = require("../validations/departamentoSchema")

class DepartamentoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        // Rutas para departamentos
        this.router.get("/", auth, departamentoController.getAll)
        this.router.get("/:id", auth, departamentoController.getById)
        this.router.post("/", auth, isAdmin, validateRequest(createDepartamentoSchema), departamentoController.create)
        this.router.put("/:id", auth, isAdmin, validateRequest(updateDepartamentoSchema), departamentoController.update)
        this.router.delete("/:id", auth, isAdmin, departamentoController.delete)
        this.router.patch("/:id", auth, isAdmin, validateRequest(changeStatusSchema), departamentoController.changeStatus)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new DepartamentoRepository()

