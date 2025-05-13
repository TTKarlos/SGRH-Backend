const express = require("express")
const convenioController = require("../controllers/convenioController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const { createConvenioSchema, updateConvenioSchema } = require("../validations/convenioSchema")

class ConvenioRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, convenioController.getAll)
        this.router.get("/:id", auth, convenioController.getById)
        this.router.get("/:id/categorias", auth, convenioController.getCategorias)
        this.router.post("/", auth, isAdmin, validateRequest(createConvenioSchema), convenioController.create)
        this.router.put("/:id", auth, isAdmin, validateRequest(updateConvenioSchema), convenioController.update)
        this.router.delete("/:id", auth, isAdmin, convenioController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new ConvenioRepository()