const { Documento, Empleado, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")
const fs = require("fs-extra")
const path = require("path")

const documentoController = {
    count: asyncHandler(async (req, res) => {
        const totalDocumentos = await Documento.count();

        return res.status(200).json(
            createResponse(true, "Total de documentos obtenido correctamente", {
                total: totalDocumentos
            })
        );
    }),

    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const id_empleado = req.query.id_empleado || null
        const fecha_desde = req.query.fecha_desde || null
        const fecha_hasta = req.query.fecha_hasta || null
        const order = req.query.order || "DESC"
        const orderBy = req.query.orderBy || "fecha_subida"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "observaciones"])
        }

        const filtros = buildFilterClause({
            id_empleado,
        })

        if (fecha_desde) {
            filtros.fecha_subida = { ...(filtros.fecha_subida || {}), [Op.gte]: new Date(fecha_desde) }
        }

        if (fecha_hasta) {
            filtros.fecha_subida = { ...(filtros.fecha_subida || {}), [Op.lte]: new Date(fecha_hasta) }
        }

        whereClause = { ...whereClause, ...filtros }

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        }

        const { data: documentos, pagination } = await paginate(Documento, req, options)

        return res.status(200).json(
            createResponse(true, "Documentos obtenidos correctamente", {
                documentos,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de documento inválido", 400)
        }

        const documento = await Documento.findByPk(id, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        if (!documento) {
            throw new AppError(`Documento con ID ${id} no encontrado`, 404)
        }

        return res.status(200).json(
            createResponse(true, "Documento obtenido correctamente", {
                documento,
            }),
        )
    }),

    upload: asyncHandler(async (req, res) => {
        if (!req.file) {
            throw new AppError("No se ha proporcionado ningún archivo", 400)
        }

        const { id_empleado, nombre, observaciones } = req.body

        validateFields(["id_empleado", "nombre"], req.body)

        const empleadoExiste = await Empleado.findByPk(id_empleado)
        if (!empleadoExiste) {
            await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
            throw new AppError("El empleado especificado no existe", 404)
        }

        const nuevoDocumento = await Documento.create({
            id_empleado,
            nombre,
            ruta_archivo: req.file.path,
            nombre_original: req.file.originalname,
            mimetype: req.file.mimetype,
            tamano: req.file.size,
            observaciones,
            fecha_subida: new Date(),
        })

        const documentoConRelaciones = await Documento.findByPk(nuevoDocumento.id_documento, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        return res
            .status(201)
            .json(createResponse(true, "Documento subido correctamente", { documento: documentoConRelaciones }, 201))
    }),

    download: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de documento inválido", 400)
        }

        const documento = await Documento.findByPk(id)

        if (!documento) {
            throw new AppError(`Documento con ID ${id} no encontrado`, 404)
        }

        if (!documento.ruta_archivo) {
            throw new AppError("Este documento no tiene un archivo físico asociado", 404)
        }

        try {
            await fs.access(documento.ruta_archivo)
        } catch (error) {
            throw new AppError("El archivo físico no se encuentra en el servidor", 404)
        }

        res.download(documento.ruta_archivo, documento.nombre_original, (err) => {
            if (err) {
                console.error("Error al descargar el archivo:", err)
            }
        })
    }),

    preview: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de documento inválido", 400)
        }

        const documento = await Documento.findByPk(id)

        if (!documento) {
            throw new AppError(`Documento con ID ${id} no encontrado`, 404)
        }

        if (!documento.ruta_archivo) {
            throw new AppError("Este documento no tiene un archivo físico asociado", 404)
        }

        try {
            await fs.access(documento.ruta_archivo)
        } catch (error) {
            throw new AppError("El archivo físico no se encuentra en el servidor", 404)
        }

        const viewableMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif"]

        res.setHeader("Content-Type", documento.mimetype)

        if (viewableMimeTypes.includes(documento.mimetype)) {
            res.setHeader("Content-Disposition", `inline; filename="${documento.nombre_original}"`)
        } else {
            res.setHeader("Content-Disposition", `attachment; filename="${documento.nombre_original}"`)
        }

        const fileStream = fs.createReadStream(documento.ruta_archivo)
        fileStream.on("error", (error) => {
            console.error("Error al leer el archivo:", error)
            if (!res.headersSent) {
                res.status(500).json(createResponse(false, "Error al leer el archivo", null, 500))
            }
        })
        fileStream.pipe(res)
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de documento inválido", 400)
        }

        const documento = await Documento.findByPk(id)

        if (!documento) {
            throw new AppError(`Documento con ID ${id} no encontrado`, 404)
        }

        if (documento.ruta_archivo) {
            try {
                await fs.access(documento.ruta_archivo)
                await fs.unlink(documento.ruta_archivo)
            } catch (error) {
                console.error("Error al eliminar archivo físico:", error)
            }
        }

        await documento.destroy()

        return res.status(200).json(createResponse(true, "Documento eliminado correctamente"))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre, observaciones, id_empleado } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de documento inválido", 400)
        }

        validateFields(["nombre"], req.body)

        const documento = await Documento.findByPk(id)

        if (!documento) {
            throw new AppError(`Documento con ID ${id} no encontrado`, 404)
        }

        if (id_empleado) {
            const empleadoExiste = await Empleado.findByPk(id_empleado)
            if (!empleadoExiste) {
                throw new AppError("El empleado especificado no existe", 404)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre", "observaciones", "id_empleado"])

        await documento.update(updateData)

        const documentoActualizado = await Documento.findByPk(id, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        return res
            .status(200)
            .json(createResponse(true, "Documento actualizado correctamente", { documento: documentoActualizado }))
    }),

    updateWithFile: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre, observaciones, id_empleado } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de documento inválido", 400)
        }

        validateFields(["nombre"], req.body)

        if (!req.file) {
            throw new AppError("No se ha proporcionado ningún archivo", 400)
        }

        const documento = await Documento.findByPk(id)

        if (!documento) {
            throw new AppError(`Documento con ID ${id} no encontrado`, 404)
        }

        if (id_empleado) {
            const empleadoExiste = await Empleado.findByPk(id_empleado)
            if (!empleadoExiste) {
                await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
                throw new AppError("El empleado especificado no existe", 404)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre", "observaciones", "id_empleado"])

        if (documento.ruta_archivo) {
            try {
                await fs.access(documento.ruta_archivo)
                await fs.unlink(documento.ruta_archivo)
            } catch (error) {
                console.error("Error al eliminar archivo anterior:", error)
            }
        }

        Object.assign(updateData, {
            ruta_archivo: req.file.path,
            nombre_original: req.file.originalname,
            mimetype: req.file.mimetype,
            tamano: req.file.size,
        })

        await documento.update(updateData)

        const documentoActualizado = await Documento.findByPk(id, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        return res
            .status(200)
            .json(createResponse(true, "Documento actualizado correctamente", { documento: documentoActualizado }))
    }),

    getByEmpleado: asyncHandler(async (req, res) => {
        const { id_empleado } = req.params

        if (!id_empleado || isNaN(Number.parseInt(id_empleado, 10))) {
            throw new AppError("ID de empleado inválido", 400)
        }

        const empleado = await Empleado.findByPk(id_empleado)

        if (!empleado) {
            throw new AppError(`Empleado con ID ${id_empleado} no encontrado`, 404)
        }

        const options = {
            where: { id_empleado },
            order: [["fecha_subida", "DESC"]],
        }

        const { data: documentos, pagination } = await paginate(Documento, req, options)

        return res.status(200).json(
            createResponse(true, "Documentos del empleado obtenidos correctamente", {
                documentos,
                pagination,
                empleado: {
                    id_empleado: empleado.id_empleado,
                    nombre: empleado.nombre,
                    apellidos: empleado.apellidos,
                },
            }),
        )
    }),
}

module.exports = documentoController