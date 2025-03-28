const express = require("express")
const rolController = require("../controllers/rolController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")

class RolRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, (req, res, next) => {
            rolController.getAllRoles(req, res, next)
        })

        this.router.get("/:id", [auth, isAdmin], (req, res, next) => {
            rolController.getRolById(req, res, next)
        })

        this.router.post("/", [auth, isAdmin], (req, res, next) => {
            rolController.createRol(req, res, next)
        })

        this.router.put("/:id", [auth, isAdmin], (req, res, next) => {
            rolController.updateRol(req, res, next)
        })

        this.router.delete("/:id", [auth, isAdmin], (req, res, next) => {
            rolController.deleteRol(req, res, next)
        })

        this.router.post("/add", [auth, isAdmin], (req, res, next) => {
            rolController.addPermisosToRol(req, res, next)
        })

        this.router.post("/remove", [auth, isAdmin], (req, res, next) => {
            rolController.removePermisosFromRol(req, res, next)
        })
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new RolRepository()

