const express = require("express")
const authController = require("../controllers/authController")
const auth = require("../middlewares/auth")
const validateRequest = require("../utils/validateRequest")
const { loginSchema, changePasswordSchema } = require("../validations/authSchema")

class AuthRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        // Rutas públicas
        this.router.post("/login", validateRequest(loginSchema), authController.login)
        // this.router.post("/register", authController.register) // Descomentar si se necesita

        // Rutas protegidas
        this.router.post("/logout", auth, authController.logout)
        this.router.get("/profile", auth, authController.profile)
        this.router.post("/change-password", auth, validateRequest(changePasswordSchema), authController.changePassword)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new AuthRepository()

