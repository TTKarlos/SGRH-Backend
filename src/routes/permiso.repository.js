const express = require("express")
const permisoController = require("../controllers/permisoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")

class PermisoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        // Rutas protegidas (solo administradores)

        this.router.get("/permisos", [auth, isAdmin], (req, res, next) => {
            permisoController.getAllPermisos(req, res, next)
        })

        this.router.get("/roles", [auth, isAdmin], (req, res, next) => {
            permisoController.getAllRolesWithPermisos(req, res, next)
        })

        this.router.get("/roles/:id", [auth, isAdmin], (req, res, next) => {
            permisoController.getRolWithPermisos(req, res, next)
        })

        this.router.post("/roles", [auth, isAdmin], (req, res, next) => {
            permisoController.createRol(req, res, next)
        })

        this.router.put("/roles/:id", [auth, isAdmin], (req, res, next) => {
            permisoController.updateRol(req, res, next)
        })

        this.router.delete("/roles/:id", [auth, isAdmin], (req, res, next) => {
            permisoController.deleteRol(req, res, next)
        })

        this.router.post("/roles/assign", [auth, isAdmin], (req, res, next) => {
            permisoController.assignPermisosToRol(req, res, next)
        })

        this.router.post("/roles/add", [auth, isAdmin], (req, res, next) => {
            permisoController.addPermisosToRol(req, res, next)
        })

        this.router.post("/roles/remove", [auth, isAdmin], (req, res, next) => {
            permisoController.removePermisosFromRol(req, res, next)
        })
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new PermisoRepository()

