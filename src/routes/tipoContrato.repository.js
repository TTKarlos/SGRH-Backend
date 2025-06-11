const express = require("express")
const tipoContratoController = require("../controllers/tipoContratoController")
const auth = require("../middlewares/auth")
const validateRequest = require("../utils/validateRequest")
const { createTipoContratoSchema, updateTipoContratoSchema } = require("../validations/tipoContratoSchema")

class TipoContratoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, tipoContratoController.getAll)
        this.router.get("/:id", auth, tipoContratoController.getById)
        this.router.post("/", auth, validateRequest(createTipoContratoSchema), tipoContratoController.create)
        this.router.put("/:id", auth, validateRequest(updateTipoContratoSchema), tipoContratoController.update)
        this.router.delete("/:id", auth, tipoContratoController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new TipoContratoRepository()