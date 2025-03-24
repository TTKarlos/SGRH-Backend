const express = require("express")
const authController = require("../controllers/authController")
const auth = require("../middlewares/auth")
const validateRequest = require("../middlewares/validateRequest")
const { loginSchema, usuarioSchema, passwordChangeSchema } = require("../validations/userSchema")

class AuthRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/status", (req, res) => {
            res.json({ status: "Las rutas de AUTH estan funcionando!" })
        })

        this.router.post("/login", validateRequest(loginSchema), (req, res, next) => {
            authController.login(req, res, next)
        })
        //Descomentar en caso de uso
/*
        this.router.post("/register", validateRequest(usuarioSchema), (req, res, next) => {
            authController.register(req, res, next)
        })
*/
        //Rutas protegidas
        this.router.post("/logout", auth, (req, res, next) => {
            authController.logout(req, res, next)
        })

        this.router.get("/profile", auth, (req, res, next) => {
            authController.profile(req, res, next)
        })

        this.router.post("/change-password", auth, validateRequest(passwordChangeSchema), (req, res, next) => {
            authController.changePassword(req, res, next)
        })
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new AuthRepository()

