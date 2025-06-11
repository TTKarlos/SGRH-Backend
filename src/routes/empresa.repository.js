const express = require("express")
const empresaController = require("../controllers/empresaController")
const auth = require("../middlewares/auth")
const validateRequest = require("../utils/validateRequest")
const { createEmpresaSchema, updateEmpresaSchema } = require("../validations/empresaSchema")

class EmpresaRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/count", auth, empresaController.count)
        this.router.get("/", auth, empresaController.getAll)
        this.router.get("/:id", auth, empresaController.getById)
        this.router.post("/", auth, validateRequest(createEmpresaSchema), empresaController.create)
        this.router.put("/:id", auth, validateRequest(updateEmpresaSchema), empresaController.update)
        this.router.delete("/:id", auth, empresaController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new EmpresaRepository()