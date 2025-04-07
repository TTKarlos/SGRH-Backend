const express = require("express")
const zonaController = require("../controllers/zonaController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const { createZonaSchema, updateZonaSchema } = require("../validations/zonaSchema")

class ZonaRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, zonaController.getAll)
        this.router.get("/:id", auth, zonaController.getById)
        this.router.post("/add", auth, isAdmin, validateRequest(createZonaSchema), zonaController.create)
        this.router.put("/:id", auth, isAdmin, validateRequest(updateZonaSchema), zonaController.update)
        this.router.delete("/:id", auth, isAdmin, zonaController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new ZonaRepository()

