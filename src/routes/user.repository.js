const express = require("express")
const userController = require("../controllers/userController")
const auth = require("../middlewares/auth")
const validateRequest = require("../middlewares/validateRequest")
const { usuarioSchema } = require("../validations/userSchema")
const {isAdmin} = require("../middlewares/roleMiddleware");
const empleadosController = require("../controllers/empleadoController");

/**
 * User routes handler
 */
class UserRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }
run 
    setupRoutes() {
        this.router.get("/", [auth, isAdmin], (req, res, next) => {
            userController.getAll(req, res, next)
        })

        this.router.get("/:id", [auth, isAdmin], (req, res, next) => {
            userController.getById(req, res, next)
        })

        this.router.post("/", [auth, isAdmin], validateRequest(usuarioSchema), (req, res, next) => {
            userController.create(req, res, next)
        })

        this.router.put("/:id", [auth, isAdmin], validateRequest(usuarioSchema), (req, res, next) => {
            userController.update(req, res, next)
        })

        this.router.delete("/:id", [auth, isAdmin], (req, res, next) => {
            userController.delete(req, res, next)
        })

        this.router.patch("/:id", [auth, isAdmin], (req, res, next) => {
            userController.changeStatus(req, res, next)
        })
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new UserRepository()

