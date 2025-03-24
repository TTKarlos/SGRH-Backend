const express = require("express")
const userController = require("../controllers/userController")
const auth = require("../middlewares/auth")
const validateRequest = require("../middlewares/validateRequest")
const { usuarioSchema } = require("../validations/userSchema")

/**
 * User routes handler
 */
class UserRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, (req, res, next) => {
            userController.getAll(req, res, next)
        })

        this.router.get("/:id", auth, (req, res, next) => {
            userController.getById(req, res, next)
        })

        this.router.post("/", auth, validateRequest(usuarioSchema), (req, res, next) => {
            userController.create(req, res, next)
        })

        this.router.put("/:id", auth, validateRequest(usuarioSchema), (req, res, next) => {
            userController.update(req, res, next)
        })

        this.router.delete("/:id", auth, (req, res, next) => {
            userController.delete(req, res, next)
        })
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new UserRepository()

