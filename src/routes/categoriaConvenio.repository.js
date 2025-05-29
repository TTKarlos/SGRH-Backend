const express = require("express")
const categoriaConvenioController = require("../controllers/categoriaConvenioController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const {
    createCategoriaConvenioSchema,
    updateCategoriaConvenioSchema,
} = require("../validations/categoriaConvenioSchema")

class CategoriaConvenioRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/", auth, categoriaConvenioController.getAll)
        this.router.get("/convenio/:idConvenio", auth, categoriaConvenioController.getByConvenio)
        this.router.get("/:id", auth, categoriaConvenioController.getById)
        this.router.post(
            "/",
            auth,
            isAdmin,
            validateRequest(createCategoriaConvenioSchema),
            categoriaConvenioController.create,
        )
        this.router.put(
            "/:id",
            auth,
            isAdmin,
            validateRequest(updateCategoriaConvenioSchema),
            categoriaConvenioController.update,
        )
        this.router.delete("/:id", auth, isAdmin, categoriaConvenioController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new CategoriaConvenioRepository()
