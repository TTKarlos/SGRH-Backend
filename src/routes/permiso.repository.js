const express = require("express")
const permisoController = require("../controllers/permisoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")

class PermisoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {

        this.router.get("/", [auth, isAdmin], (req, res, next) => {
            permisoController.getAllPermisos(req, res, next)
        })


        this.router.get("/:id", [auth, isAdmin], (req, res, next) => {
            permisoController.getPermisoById(req, res, next)
        })
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new PermisoRepository()

