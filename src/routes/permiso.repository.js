const express = require("express")
const permisoController = require("../controllers/permisoController")
const auth = require("../middlewares/auth")

class PermisoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, permisoController.getAllPermisos)
        this.router.get("/:id", auth, permisoController.getPermisoById)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new PermisoRepository()

