const express = require("express")
const userController = require("../controllers/userController")
const auth = require("../middlewares/auth")
const validateRequest = require("../utils/validateRequest")
const { createUserSchema, updateUserSchema, resetPasswordSchema } = require("../validations/userSchema")

class UserRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, userController.getAll)
        this.router.get("/:id", auth, userController.getById)
        this.router.post("/", auth, validateRequest(createUserSchema), userController.create)
        this.router.put("/:id", auth, validateRequest(updateUserSchema), userController.update)
        this.router.delete("/:id", auth, userController.delete)
        this.router.patch("/:id/status", auth, userController.changeStatus)
        this.router.post("/:id/reset-password", auth, validateRequest(resetPasswordSchema), userController.resetPassword)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new UserRepository()