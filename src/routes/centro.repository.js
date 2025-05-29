const express = require("express")
const centroController = require("../controllers/centroController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const { createCentroSchema, updateCentroSchema } = require("../validations/centroSchema")

class CentroRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/count", auth, centroController.count)
        this.router.get("/", auth, centroController.getAll)
        this.router.get("/:id", auth, centroController.getById)
        this.router.post("/", auth, isAdmin, validateRequest(createCentroSchema), centroController.create)
        this.router.put("/:id", auth, isAdmin, validateRequest(updateCentroSchema), centroController.update)
        this.router.delete("/:id", auth, isAdmin, centroController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new CentroRepository()

