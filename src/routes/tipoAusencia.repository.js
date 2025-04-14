const express = require("express")
const tipoAusenciaController = require("../controllers/tipoAusenciaController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const { createTipoAusenciaSchema, updateTipoAusenciaSchema } = require("../validations/tipoAusenciaSchema")

class TipoAusenciaRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, tipoAusenciaController.getAll)
        this.router.get("/:id", auth, tipoAusenciaController.getById)
        this.router.post("/", auth, isAdmin, validateRequest(createTipoAusenciaSchema), tipoAusenciaController.create)
        this.router.put("/:id", auth, isAdmin, validateRequest(updateTipoAusenciaSchema), tipoAusenciaController.update)
        this.router.delete("/:id", auth, isAdmin, tipoAusenciaController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new TipoAusenciaRepository()
