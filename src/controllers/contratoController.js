const { Contrato, Empleado, TipoContrato, Empresa, Convenio, CategoriaConvenio, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler, buildUpdateObject } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildFilterClause } = require("../utils/queryBuilder")
const fs = require("fs-extra")
const path = require("path")

const processFormData = (data) => {
    const processed = { ...data }

    const numberFields = [
        "id_empleado",
        "id_tipo_contrato",
        "id_empresa",
        "id_convenio",
        "id_categoria",
        "antiguedad_contrato",
    ]

    numberFields.forEach((field) => {
        if (processed[field] !== undefined && processed[field] !== null && processed[field] !== "") {
            const num = Number(processed[field])
            if (!isNaN(num)) {
                processed[field] = num
            }
        }
    })

    const nullableFields = ["id_convenio", "id_categoria", "fecha_fin", "fin_periodo_prueba", "observaciones"]
    nullableFields.forEach((field) => {
        if (processed[field] === "" || processed[field] === "null" || processed[field] === "undefined") {
            processed[field] = null
        }
    })

    return processed
}

const validateRequiredFields = (data, requiredFields) => {
    const missing = []

    requiredFields.forEach((field) => {
        if (data[field] === undefined || data[field] === null || data[field] === "") {
            missing.push(field)
        }
    })

    if (missing.length > 0) {
        throw new AppError(`Campos requeridos faltantes: ${missing.join(", ")}`, 400)
    }
}

const contratoController = {
    count: asyncHandler(async (req, res) => {
        const totalContratos = await Contrato.count()

        return res.status(200).json(
            createResponse(true, "Total de contratos obtenido correctamente", {
                total: totalContratos,
            }),
        )
    }),

    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const id_empleado = req.query.id_empleado || null
        const id_tipo_contrato = req.query.id_tipo_contrato || null
        const id_empresa = req.query.id_empresa || null
        const id_convenio = req.query.id_convenio || null
        const vigentes = req.query.vigentes === "true"
        const fecha_desde = req.query.fecha_desde || null
        const fecha_hasta = req.query.fecha_hasta || null
        const order = req.query.order || "DESC"
        const orderBy = req.query.orderBy || "fecha_inicio"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["id_contrato"])
        }

        const filtros = buildFilterClause({
            id_empleado,
            id_tipo_contrato,
            id_empresa,
            id_convenio,
        })

        if (fecha_desde) {
            filtros.fecha_inicio = { ...(filtros.fecha_inicio || {}), [Op.gte]: new Date(fecha_desde) }
        }

        if (fecha_hasta) {
            filtros.fecha_inicio = { ...(filtros.fecha_inicio || {}), [Op.lte]: new Date(fecha_hasta) }
        }

        if (vigentes) {
            filtros[Op.or] = [{ fecha_fin: null }, { fecha_fin: { [Op.gte]: new Date() } }]
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
                {
                    model: TipoContrato,
                    attributes: ["id_tipo_contrato", "nombre", "codigo"],
                },
                {
                    model: Empresa,
                    attributes: ["id_empresa", "nombre", "cif"],
                },
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre", "numero_convenio"],
                    required: false,
                },
                {
                    model: CategoriaConvenio,
                    attributes: ["id_categoria", "nombre"],
                    required: false,
                },
            ],
        }

        const { data: contratos, pagination } = await paginate(Contrato, req, options)

        return res.status(200).json(
            createResponse(true, "Contratos obtenidos correctamente", {
                contratos,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de contrato inválido", 400)
        }

        const contrato = await Contrato.findByPk(id, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
                {
                    model: TipoContrato,
                    attributes: ["id_tipo_contrato", "nombre", "codigo"],
                },
                {
                    model: Empresa,
                    attributes: ["id_empresa", "nombre", "cif"],
                },
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre", "numero_convenio"],
                    required: false,
                },
                {
                    model: CategoriaConvenio,
                    attributes: ["id_categoria", "nombre"],
                    required: false,
                },
            ],
        })

        if (!contrato) {
            throw new AppError(`Contrato con ID ${id} no encontrado`, 404)
        }

        return res.status(200).json(
            createResponse(true, "Contrato obtenido correctamente", {
                contrato,
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        console.log("=== CREATE CONTRATO ===")
        console.log("Body:", req.body)
        console.log("File:", req.file)

        try {
            const {
                id_empleado,
                id_tipo_contrato,
                id_empresa,
                id_convenio,
                id_categoria,
                fecha_inicio,
                fecha_fin,
                fin_periodo_prueba,
                antiguedad_contrato,
                observaciones,
            } = req.body

            if (!id_empleado || !id_tipo_contrato || !id_empresa || !fecha_inicio) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
                }
                return res.status(400).json({
                    success: false,
                    message: "Faltan campos requeridos: id_empleado, id_tipo_contrato, id_empresa, fecha_inicio",
                })
            }

            const fechaFinDate = fecha_fin ? new Date(fecha_fin) : null
            const esContratoVigente = !fechaFinDate || fechaFinDate >= new Date()

            if (esContratoVigente) {
                const contratoVigente = await Contrato.findOne({
                    where: {
                        id_empleado: Number(id_empleado),
                        [Op.or]: [{ fecha_fin: null }, { fecha_fin: { [Op.gte]: new Date() } }],
                    },
                })

                if (contratoVigente) {
                    if (req.file) {
                        await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
                    }
                    return res.status(400).json({
                        success: false,
                        message: "El empleado ya tiene un contrato vigente",
                    })
                }
            }

            const contratoData = {
                id_empleado: Number(id_empleado),
                id_tipo_contrato: Number(id_tipo_contrato),
                id_empresa: Number(id_empresa),
                id_convenio: id_convenio && id_convenio !== "null" ? Number(id_convenio) : null,
                id_categoria: id_categoria && id_categoria !== "null" ? Number(id_categoria) : null,
                fecha_inicio: new Date(fecha_inicio),
                fecha_fin: fechaFinDate,
                fin_periodo_prueba: fin_periodo_prueba ? new Date(fin_periodo_prueba) : null,
                antiguedad_contrato: antiguedad_contrato ? Number(antiguedad_contrato) : 0,
                observaciones: observaciones || null,
                fecha_creacion: new Date(),
            }

            if (req.file) {
                contratoData.ruta_archivo = req.file.path
                contratoData.nombre_original = req.file.originalname
                contratoData.mimetype = req.file.mimetype
                contratoData.tamano = req.file.size
            }

            console.log("Datos a crear:", contratoData)

            const nuevoContrato = await Contrato.create(contratoData)
            console.log("Contrato creado con ID:", nuevoContrato.id_contrato)

            return res.status(201).json({
                success: true,
                message: "Contrato creado correctamente",
                data: {
                    id_contrato: nuevoContrato.id_contrato,
                },
            })
        } catch (error) {
            console.error("Error al crear contrato:", error)

            if (req.file) {
                await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
            }

            if (error.name === "SequelizeForeignKeyConstraintError") {
                const field = error.fields[0]
                const fieldNames = {
                    id_empleado: "empleado",
                    id_tipo_contrato: "tipo de contrato",
                    id_empresa: "empresa",
                    id_convenio: "convenio",
                    id_categoria: "categoría",
                }
                return res.status(404).json({
                    success: false,
                    message: `El ${fieldNames[field] || field} especificado no existe`,
                })
            }

            return res.status(500).json({
                success: false,
                message: "Error al crear el contrato",
                error: error.message,
            })
        }
    }),

    update: asyncHandler(async (req, res) => {
        console.log("=== UPDATE CONTRATO ===")
        console.log("Params:", req.params)
        console.log("Body:", req.body)
        console.log("File:", req.file)

        try {
            const { id } = req.params

            if (!id || isNaN(Number.parseInt(id, 10))) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
                }
                return res.status(400).json({
                    success: false,
                    message: "ID de contrato inválido",
                })
            }

            const contrato = await Contrato.findByPk(id)

            if (!contrato) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
                }
                return res.status(404).json({
                    success: false,
                    message: `Contrato con ID ${id} no encontrado`,
                })
            }

            console.log("Contrato encontrado:", contrato.toJSON())

            const updateData = {}

            const allowedFields = [
                "id_empleado",
                "id_tipo_contrato",
                "id_empresa",
                "id_convenio",
                "id_categoria",
                "fecha_inicio",
                "fecha_fin",
                "fin_periodo_prueba",
                "antiguedad_contrato",
                "observaciones",
            ]

            allowedFields.forEach((field) => {
                if (req.body[field] !== undefined) {
                    let value = req.body[field]

                    if (value === "" || value === "null" || value === "undefined") {
                        value = null
                    }

                    if (
                        [
                            "id_empleado",
                            "id_tipo_contrato",
                            "id_empresa",
                            "id_convenio",
                            "id_categoria",
                            "antiguedad_contrato",
                        ].includes(field)
                    ) {
                        if (value !== null) {
                            value = Number(value)
                            if (isNaN(value)) {
                                return res.status(400).json({
                                    success: false,
                                    message: `Valor inválido para ${field}`,
                                })
                            }
                        }
                    }

                    if (["fecha_inicio", "fecha_fin", "fin_periodo_prueba"].includes(field)) {
                        if (value !== null) {
                            value = new Date(value)
                            if (isNaN(value.getTime())) {
                                return res.status(400).json({
                                    success: false,
                                    message: `Fecha inválida para ${field}`,
                                })
                            }
                        }
                    }

                    updateData[field] = value
                }
            })

            console.log("Datos a actualizar:", updateData)

            const requiredFields = ["id_empleado", "id_tipo_contrato", "id_empresa", "fecha_inicio"]
            for (const field of requiredFields) {
                if (updateData[field] !== undefined && (updateData[field] === null || updateData[field] === "")) {
                    if (req.file) {
                        await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
                    }
                    return res.status(400).json({
                        success: false,
                        message: `El campo ${field} es requerido`,
                    })
                }
            }

            const fechaInicio = updateData.fecha_inicio || contrato.fecha_inicio
            const fechaFin = updateData.fecha_fin !== undefined ? updateData.fecha_fin : contrato.fecha_fin
            const finPeriodoPrueba =
                updateData.fin_periodo_prueba !== undefined ? updateData.fin_periodo_prueba : contrato.fin_periodo_prueba

            if (fechaFin && fechaInicio && new Date(fechaFin) < new Date(fechaInicio)) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
                }
                return res.status(400).json({
                    success: false,
                    message: "La fecha de fin debe ser posterior a la fecha de inicio",
                })
            }

            if (finPeriodoPrueba && fechaInicio && new Date(finPeriodoPrueba) < new Date(fechaInicio)) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
                }
                return res.status(400).json({
                    success: false,
                    message: "El fin del periodo de prueba debe ser posterior a la fecha de inicio",
                })
            }

            if (req.file) {
                if (contrato.ruta_archivo) {
                    try {
                        await fs.access(contrato.ruta_archivo)
                        await fs.unlink(contrato.ruta_archivo)
                        console.log("Archivo anterior eliminado:", contrato.ruta_archivo)
                    } catch (error) {
                        console.error("Error al eliminar archivo anterior:", error)
                    }
                }

                updateData.ruta_archivo = req.file.path
                updateData.nombre_original = req.file.originalname
                updateData.mimetype = req.file.mimetype
                updateData.tamano = req.file.size

                console.log("Nuevo archivo agregado:", {
                    ruta: req.file.path,
                    nombre: req.file.originalname,
                    tipo: req.file.mimetype,
                    tamaño: req.file.size,
                })
            }

            console.log("Actualizando contrato con datos:", updateData)

            await contrato.update(updateData)
            console.log("Contrato actualizado exitosamente")

            return res.status(200).json({
                success: true,
                message: "Contrato actualizado correctamente",
                data: {
                    id_contrato: contrato.id_contrato,
                },
            })
        } catch (error) {
            console.error("Error al actualizar contrato:", error)

            // Si hay error y se subió un archivo nuevo, eliminarlo
            if (req.file) {
                await fs.unlink(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err))
            }

            // Manejar errores de foreign key
            if (error.name === "SequelizeForeignKeyConstraintError") {
                const field = error.fields[0]
                const fieldNames = {
                    id_empleado: "empleado",
                    id_tipo_contrato: "tipo de contrato",
                    id_empresa: "empresa",
                    id_convenio: "convenio",
                    id_categoria: "categoría",
                }
                return res.status(404).json({
                    success: false,
                    message: `El ${fieldNames[field] || field} especificado no existe`,
                })
            }

            // Devolver un error genérico
            return res.status(500).json({
                success: false,
                message: "Error al actualizar el contrato",
                error: error.message,
            })
        }
    }),

    updateWithFile: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de contrato inválido", 400)
        }

        if (!req.file) {
            throw new AppError("No se ha proporcionado ningún archivo", 400)
        }

        const contrato = await Contrato.findByPk(id)

        if (!contrato) {
            throw new AppError(`Contrato con ID ${id} no encontrado`, 404)
        }

        const updateData = buildUpdateObject(req.body, [
            "id_empleado",
            "id_tipo_contrato",
            "id_empresa",
            "id_convenio",
            "id_categoria",
            "fecha_inicio",
            "fecha_fin",
            "fin_periodo_prueba",
            "antiguedad_contrato",
        ])

        if (contrato.ruta_archivo) {
            try {
                await fs.access(contrato.ruta_archivo)
                await fs.unlink(contrato.ruta_archivo)
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

        await contrato.update(updateData)

        const contratoActualizado = await Contrato.findByPk(id, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
                {
                    model: TipoContrato,
                    attributes: ["id_tipo_contrato", "nombre", "codigo"],
                },
                {
                    model: Empresa,
                    attributes: ["id_empresa", "nombre", "cif"],
                },
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre", "numero_convenio"],
                },
                {
                    model: CategoriaConvenio,
                    attributes: ["id_categoria", "nombre"],
                },
            ],
        })

        return res
            .status(200)
            .json(createResponse(true, "Contrato actualizado correctamente", { contrato: contratoActualizado }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de contrato inválido", 400)
        }

        const contrato = await Contrato.findByPk(id)

        if (!contrato) {
            throw new AppError(`Contrato con ID ${id} no encontrado`, 404)
        }

        if (contrato.ruta_archivo) {
            try {
                await fs.access(contrato.ruta_archivo)
                await fs.unlink(contrato.ruta_archivo)
            } catch (error) {
                console.error("Error al eliminar archivo físico:", error)
            }
        }

        await contrato.destroy()

        return res.status(200).json(createResponse(true, "Contrato eliminado correctamente"))
    }),

    download: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de contrato inválido", 400)
        }

        const contrato = await Contrato.findByPk(id)

        if (!contrato) {
            throw new AppError(`Contrato con ID ${id} no encontrado`, 404)
        }

        if (!contrato.ruta_archivo) {
            throw new AppError("Este contrato no tiene un archivo físico asociado", 404)
        }

        try {
            await fs.access(contrato.ruta_archivo)
        } catch (error) {
            throw new AppError("El archivo físico no se encuentra en el servidor", 404)
        }

        res.download(contrato.ruta_archivo, contrato.nombre_original, (err) => {
            if (err) {
                console.error("Error al descargar el archivo:", err)
            }
        })
    }),

    preview: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de contrato inválido", 400)
        }

        const contrato = await Contrato.findByPk(id)

        if (!contrato) {
            throw new AppError(`Contrato con ID ${id} no encontrado`, 404)
        }

        if (!contrato.ruta_archivo) {
            throw new AppError("Este contrato no tiene un archivo físico asociado", 404)
        }

        try {
            await fs.access(contrato.ruta_archivo)
        } catch (error) {
            throw new AppError("El archivo físico no se encuentra en el servidor", 404)
        }

        const viewableMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif"]

        res.setHeader("Content-Type", contrato.mimetype)

        if (viewableMimeTypes.includes(contrato.mimetype)) {
            res.setHeader("Content-Disposition", `inline; filename="${contrato.nombre_original}"`)
        } else {
            res.setHeader("Content-Disposition", `attachment; filename="${contrato.nombre_original}"`)
        }

        const fileStream = fs.createReadStream(contrato.ruta_archivo)
        fileStream.on("error", (error) => {
            console.error("Error al leer el archivo:", error)
            if (!res.headersSent) {
                res.status(500).json(createResponse(false, "Error al leer el archivo"))
            }
        })
        fileStream.pipe(res)
    }),

    // Obtener contratos por empleado
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
            order: [["fecha_inicio", "DESC"]],
            include: [
                {
                    model: TipoContrato,
                    attributes: ["id_tipo_contrato", "nombre", "codigo"],
                },
                {
                    model: Empresa,
                    attributes: ["id_empresa", "nombre", "cif"],
                },
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre"],
                    required: false,
                },
                {
                    model: CategoriaConvenio,
                    attributes: ["id_categoria", "nombre"],
                    required: false,
                },
            ],
        }

        const { data: contratos, pagination } = await paginate(Contrato, req, options)

        const contratoVigente = contratos.find((c) => c.fecha_fin === null || new Date(c.fecha_fin) >= new Date())

        return res.status(200).json(
            createResponse(true, "Contratos del empleado obtenidos correctamente", {
                contratos,
                pagination,
                empleado: {
                    id_empleado: empleado.id_empleado,
                    nombre: empleado.nombre,
                    apellidos: empleado.apellidos,
                },
                estadisticas: {
                    total: contratos.length,
                    vigente: !!contratoVigente,
                    contratoVigente: contratoVigente || null,
                },
            }),
        )
    }),

    // Obtener contratos próximos a vencer
    getProximosAVencer: asyncHandler(async (req, res) => {
        const diasLimite = Number.parseInt(req.query.dias || 90, 10)
        const id_empresa = req.query.id_empresa || null
        const id_tipo_contrato = req.query.id_tipo_contrato || null
        const id_empleado = req.query.id_empleado || null
        const order = req.query.order || "ASC"
        const orderBy = req.query.orderBy || "fecha_fin"

        const fechaActual = new Date()
        const fechaLimite = new Date()
        fechaLimite.setDate(fechaLimite.getDate() + diasLimite)

        const whereClause = {
            fecha_fin: {
                [Op.ne]: null,
                [Op.gt]: fechaActual,
                [Op.lte]: fechaLimite,
            },
        }

        if (id_empresa) whereClause.id_empresa = id_empresa
        if (id_tipo_contrato) whereClause.id_tipo_contrato = id_tipo_contrato
        if (id_empleado) whereClause.id_empleado = id_empleado

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
                {
                    model: TipoContrato,
                    attributes: ["id_tipo_contrato", "nombre", "codigo"],
                },
                {
                    model: Empresa,
                    attributes: ["id_empresa", "nombre", "cif"],
                },
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre"],
                    required: false,
                },
                {
                    model: CategoriaConvenio,
                    attributes: ["id_categoria", "nombre"],
                    required: false,
                },
            ],
        }

        const { data: contratos, pagination } = await paginate(Contrato, req, options)

        const contratosConDiasRestantes = contratos.map((contrato) => {
            const fechaFin = new Date(contrato.fecha_fin)
            const diasRestantes = Math.ceil((fechaFin - fechaActual) / (1000 * 60 * 60 * 24))

            return { ...contrato.dataValues, diasRestantes }
        })

        const estadisticas = {
            total: contratosConDiasRestantes.length,
            proximaSemana: contratosConDiasRestantes.filter((c) => c.diasRestantes <= 7).length,
            proximoMes: contratosConDiasRestantes.filter((c) => c.diasRestantes <= 30).length,
            proximosTresMeses: contratosConDiasRestantes.filter((c) => c.diasRestantes <= 90).length,
        }

        return res.status(200).json(
            createResponse(true, "Contratos próximos a vencer obtenidos correctamente", {
                contratos: contratosConDiasRestantes,
                pagination,
                estadisticas,
            }),
        )
    }),
}

module.exports = contratoController
