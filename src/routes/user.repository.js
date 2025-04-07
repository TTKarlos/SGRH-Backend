// Ejemplo para src/routes/user.repository.js
const express = require("express")
const userController = require("../controllers/userController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const { createUserSchema, updateUserSchema, resetPasswordSchema } = require("../validations/userSchema")

class UserRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, isAdmin, userController.getAll)
        this.router.get("/:id", auth, isAdmin, userController.getById)
        this.router.post("/", auth, isAdmin, validateRequest(createUserSchema), userController.create)
        this.router.put("/:id", auth, isAdmin, validateRequest(updateUserSchema), userController.update)
        this.router.delete("/:id", auth, isAdmin, userController.delete)
        this.router.patch("/:id/status", auth, isAdmin, userController.changeStatus)
        this.router.post("/:id/reset-password", auth, isAdmin, validateRequest(resetPasswordSchema), userController.resetPassword)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new UserRepository()