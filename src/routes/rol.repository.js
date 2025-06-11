const express = require("express")
const rolController = require("../controllers/rolController")
const auth = require("../middlewares/auth")
const validateRequest = require("../utils/validateRequest")
const { createRolSchema, updateRolSchema, updatePermisosSchema } = require("../validations/rolSchema")

class RolRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/mi-rol", auth, rolController.getMiRol)
        this.router.get("/", auth, rolController.getAll)
        this.router.get("/:id", auth, rolController.getById)
        this.router.post("/", auth, validateRequest(createRolSchema), rolController.create)
        this.router.put("/:id", auth, validateRequest(updateRolSchema), rolController.update)
        this.router.delete("/:id", auth, rolController.delete)
        this.router.put("/:id/permisos", auth, validateRequest(updatePermisosSchema), rolController.updatePermisos)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new RolRepository()
