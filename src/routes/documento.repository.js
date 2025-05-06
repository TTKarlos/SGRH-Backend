const express = require("express")
const documentoController = require("../controllers/documentoController")
const auth = require("../middlewares/auth")
const { isAdmin } = require("../middlewares/roleMiddleware")
const validateRequest = require("../utils/validateRequest")
const { updateDocumentoSchema } = require("../validations/documentoSchema")
const upload = require("../utils/fileUpload")

class DocumentoRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/download/:id", auth, documentoController.download)
        this.router.get("/preview/:id", auth, documentoController.preview)

        this.router.get("/empleado/:id_empleado", auth, documentoController.getByEmpleado)

        this.router.put("/with-file/:id", auth, isAdmin, upload.single("archivo"), documentoController.updateWithFile)

        this.router.put("/metadata/:id", auth, isAdmin, validateRequest(updateDocumentoSchema), documentoController.update)

        this.router.get("/", auth, documentoController.getAll)
        this.router.get("/:id", auth, documentoController.getById)
        this.router.post("/upload", auth, isAdmin, upload.single("archivo"), documentoController.upload)

        this.router.put("/:id", auth, isAdmin, validateRequest(updateDocumentoSchema), documentoController.update)

        this.router.delete("/:id", auth, isAdmin, documentoController.delete)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new DocumentoRepository()