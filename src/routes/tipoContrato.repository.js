const express = require("express")
const tipoContratoController = require("../controllers/tipoContratoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
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
        this.router.post("/", auth, isAdmin, validateRequest(createTipoContratoSchema), tipoContratoController.create)
        this.router.put("/:id", auth, isAdmin, validateRequest(updateTipoContratoSchema), tipoContratoController.update)
        this.router.delete("/:id", auth, isAdmin, tipoContratoController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new TipoContratoRepository()