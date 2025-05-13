const { Contrato, Empleado, TipoContrato, Empresa, Convenio, CategoriaConvenio, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")
const fs = require("fs-extra")
const path = require("path")

const contratoController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const id_empleado = req.query.id_empleado || null
        const id_tipo_contrato = req.query.id_tipo_contrato || null
        const id_empresa = req.query.id_empresa || null
        const id_convenio = req.query.id_convenio || null
        const fecha_desde = req.query.fecha_desde || null
        const fecha_hasta = req.query.fecha_hasta || null
        const vigentes = req.query.vigentes === "true"
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
            filtros[Op.or] = [
                { fecha_fin: null },
                { fecha_fin: { [Op.gte]: new Date() } }
            ]
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
        } = req.body

        validateFields(["id_empleado", "id_tipo_contrato", "id_empresa", "fecha_inicio"], req.body)

        const empleado = await Empleado.findByPk(id_empleado)
        if (!empleado) {
            throw new AppError("El empleado especificado no existe", 404)
        }

        const tipoContrato = await TipoContrato.findByPk(id_tipo_contrato)
        if (!tipoContrato) {
            throw new AppError("El tipo de contrato especificado no existe", 404)
        }

        const empresa = await Empresa.findByPk(id_empresa)
        if (!empresa) {
            throw new AppError("La empresa especificada no existe", 404)
        }

        if (id_convenio) {
            const convenio = await Convenio.findByPk(id_convenio)
            if (!convenio) {
                throw new AppError("El convenio especificado no existe", 404)
            }
        }

        if (id_categoria) {
            const categoria = await CategoriaConvenio.findByPk(id_categoria)
            if (!categoria) {
                throw new AppError("La categoría especificada no existe", 404)
            }

            if (id_convenio && categoria.id_convenio !== parseInt(id_convenio)) {
                throw new AppError("La categoría no pertenece al convenio seleccionado", 400)
            }
        }

        if (fecha_fin === null || new Date(fecha_fin) >= new Date()) {
            const contratosVigentes = await Contrato.findOne({
                where: {
                    id_empleado,
                    [Op.or]: [
                        { fecha_fin: null },
                        { fecha_fin: { [Op.gte]: new Date() } }
                    ]
                }
            })

            if (contratosVigentes) {
                throw new AppError("El empleado ya tiene un contrato vigente", 400)
            }
        }

        const nuevoContrato = await Contrato.create({
            id_empleado,
            id_tipo_contrato,
            id_empresa,
            id_convenio,
            id_categoria,
            fecha_inicio,
            fecha_fin,
            fin_periodo_prueba,
            antiguedad_contrato,
            fecha_creacion: new Date(),
        })

        const contratoConRelaciones = await Contrato.findByPk(nuevoContrato.id_contrato, {
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

        return res.status(201).json(
            createResponse(true, "Contrato creado correctamente", { contrato: contratoConRelaciones }, 201)
        )
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
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
        } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de contrato inválido", 400)
        }

        const contrato = await Contrato.findByPk(id)

        if (!contrato) {
            throw new AppError(`Contrato con ID ${id} no encontrado`, 404)
        }

        if (id_empleado) {
            const empleado = await Empleado.findByPk(id_empleado)
            if (!empleado) {
                throw new AppError("El empleado especificado no existe", 404)
            }
        }

        if (id_tipo_contrato) {
            const tipoContrato = await TipoContrato.findByPk(id_tipo_contrato)
            if (!tipoContrato) {
                throw new AppError("El tipo de contrato especificado no existe", 404)
            }
        }

        if (id_empresa) {
            const empresa = await Empresa.findByPk(id_empresa)
            if (!empresa) {
                throw new AppError("La empresa especificada no existe", 404)
            }
        }

        if (id_convenio) {
            const convenio = await Convenio.findByPk(id_convenio)
            if (!convenio) {
                throw new AppError("El convenio especificado no existe", 404)
            }
        }

        if (id_categoria) {
            const categoria = await CategoriaConvenio.findByPk(id_categoria)
            if (!categoria) {
                throw new AppError("La categoría especificada no existe", 404)
            }

            const convenioId = id_convenio || contrato.id_convenio
            if (convenioId && categoria.id_convenio !== parseInt(convenioId)) {
                throw new AppError("La categoría no pertenece al convenio seleccionado", 400)
            }
        }

        const nuevoFechaFin = fecha_fin === undefined ? contrato.fecha_fin : fecha_fin
        const nuevoIdEmpleado = id_empleado || contrato.id_empleado

        if (
            (nuevoFechaFin === null || new Date(nuevoFechaFin) >= new Date()) &&
            (nuevoIdEmpleado !== contrato.id_empleado || nuevoFechaFin !== contrato.fecha_fin)
        ) {
            const contratosVigentes = await Contrato.findOne({
                where: {
                    id_empleado: nuevoIdEmpleado,
                    id_contrato: { [Op.ne]: id },
                    [Op.or]: [
                        { fecha_fin: null },
                        { fecha_fin: { [Op.gte]: new Date() } }
                    ]
                }
            })

            if (contratosVigentes) {
                throw new AppError("El empleado ya tiene otro contrato vigente", 400)
            }
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
                    required: false,
                },
                {
                    model: CategoriaConvenio,
                    attributes: ["id_categoria", "nombre"],
                    required: false,
                },
            ],
        })

        return res.status(200).json(
            createResponse(true, "Contrato actualizado correctamente", { contrato: contratoActualizado })
        )
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

    getByEmpleado: asyncHandler(async (req, res) => {
        const { id_empleado } = req.params;

        if (!id_empleado || isNaN(Number.parseInt(id_empleado, 10))) {
            throw new AppError("ID de empleado inválido", 400);
        }

        try {
            const empleado = await Empleado.findByPk(id_empleado);

            if (!empleado) {
                throw new AppError(`Empleado con ID ${id_empleado} no encontrado`, 404);
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
            };

            const { data: contratos, pagination } = await paginate(Contrato, req, options);

            const contratoVigente = contratos.find(c =>
                c.fecha_fin === null || new Date(c.fecha_fin) >= new Date()
            );

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
                        vigente: contratoVigente ? true : false,
                        contratoVigente: contratoVigente || null,
                    },
                }),
            );
        } catch (error) {
            console.error("Error en getByEmpleado:", error);

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError(`Error al obtener contratos del empleado: ${error.message}`, 500);
        }
    }),

    upload: asyncHandler(async (req, res) => {
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

        if (contrato.ruta_archivo) {
            try {
                await fs.access(contrato.ruta_archivo)
                await fs.unlink(contrato.ruta_archivo)
            } catch (error) {
                console.error("Error al eliminar archivo anterior:", error)
            }
        }

        await contrato.update({
            ruta_archivo: req.file.path,
            nombre_original: req.file.originalname,
            mimetype: req.file.mimetype,
            tamano: req.file.size,
        })

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
                    required: false,
                },
                {
                    model: CategoriaConvenio,
                    attributes: ["id_categoria", "nombre"],
                    required: false,
                },
            ],
        })

        return res.status(200).json(
            createResponse(true, "Archivo de contrato subido correctamente", { contrato: contratoActualizado })
        )
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
                res.status(500).json(createResponse(false, "Error al leer el archivo", null, 500))
            }
        })
        fileStream.pipe(res)
    }),
}

module.exports = contratoController