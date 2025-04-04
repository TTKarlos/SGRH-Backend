const express = require("express")
const departamentoController = require("../controllers/departamentoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")

class DepartamentoRouter {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, (req, res, next) => {
            departamentoController.getAll(req, res, next)
        })

        this.router.get("/:id", auth, (req, res, next) => {
            departamentoController.getById(req, res, next)
        })

        this.router.post("/add", auth, (req, res, next) => {
            departamentoController.create(req, res, next)
        })

        this.router.put("/:id", auth, (req, res, next) => {
            departamentoController.update(req, res, next)
        })

        this.router.delete("/:id", auth, (req, res, next) => {
            departamentoController.delete(req, res, next)
        })


    }

    getRoutes() {
        return this.router
    }
}

module.exports = new DepartamentoRouter()