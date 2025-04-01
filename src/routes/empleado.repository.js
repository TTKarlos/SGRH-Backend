const express = require("express")
const empleadosController = require("../controllers/empleadoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")

class PermisoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {

        this.router.get("/", auth, (req, res, next) => {
            empleadosController.getAll(req, res, next)
        })

        this.router.get("/:id", auth, (req, res, next) => {
            empleadosController.getById(req, res, next)
        })

        this.router.post("/add", auth, (req, res, next) => {
            empleadosController.create(req, res, next)
        })

        this.router.post("/:id", auth, (req, res, next) => {
            empleadosController.update(req, res, next)
        })

        this.router.post("/:id", auth, (req, res, next) => {
            empleadosController.delete(req, res, next)
        })


    }

    getRoutes() {
        return this.router
    }
}

module.exports = new PermisoRepository()

