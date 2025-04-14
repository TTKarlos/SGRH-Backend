const { Ausencia, TipoAusencia, Empleado, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")

const ausenciaController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const id_empleado = req.query.id_empleado || null
        const id_tipo_ausencia = req.query.id_tipo_ausencia || null
        const fecha_inicio = req.query.fecha_inicio || null
        const fecha_fin = req.query.fecha_fin || null
        const order = req.query.order || "DESC"
        const orderBy = req.query.orderBy || "fecha_inicio"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["fecha_inicio", "fecha_fin"])
        }

        const filtros = buildFilterClause({
            id_empleado,
            id_tipo_ausencia,
        })

        if (fecha_inicio) {
            filtros.fecha_inicio = { [Op.gte]: new Date(fecha_inicio) }
        }

        if (fecha_fin) {
            filtros.fecha_fin = { [Op.lte]: new Date(fecha_fin) }
        }

        whereClause = { ...whereClause, ...filtros }

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
            include: [
                {
                    model: TipoAusencia,
                    attributes: ["id_tipo_ausencia", "nombre"],
                },
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        }

        const { data: ausencias, pagination } = await paginate(Ausencia, req, options)

        return res.status(200).json(
            createResponse(true, "Ausencias obtenidas correctamente", {
                ausencias,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de ausencia inválido", 400)
        }

        const ausencia = await Ausencia.findByPk(id, {
            include: [
                {
                    model: TipoAusencia,
                    attributes: ["id_tipo_ausencia", "nombre"],
                },
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        if (!ausencia) {
            throw new AppError(`Ausencia con ID ${id} no encontrada`, 404)
        }

        return res.status(200).json(
            createResponse(true, "Ausencia obtenida correctamente", {
                ausencia,
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { id_empleado, id_tipo_ausencia, fecha_inicio, fecha_fin } = req.body

        validateFields(["id_empleado", "id_tipo_ausencia", "fecha_inicio", "fecha_fin"], req.body)

        const empleadoExiste = await Empleado.findByPk(id_empleado)
        if (!empleadoExiste) {
            throw new AppError("El empleado especificado no existe", 404)
        }

        const tipoAusenciaExiste = await TipoAusencia.findByPk(id_tipo_ausencia)
        if (!tipoAusenciaExiste) {
            throw new AppError("El tipo de ausencia especificado no existe", 404)
        }

        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
            throw new AppError("La fecha de fin debe ser posterior a la fecha de inicio", 400)
        }

        const ausenciasExistentes = await Ausencia.findAll({
            where: {
                id_empleado,
                [Op.or]: [
                    {
                        fecha_inicio: {
                            [Op.between]: [fecha_inicio, fecha_fin],
                        },
                    },
                    {
                        fecha_fin: {
                            [Op.between]: [fecha_inicio, fecha_fin],
                        },
                    },
                    {
                        [Op.and]: [{ fecha_inicio: { [Op.lte]: fecha_inicio } }, { fecha_fin: { [Op.gte]: fecha_fin } }],
                    },
                ],
            },
        })

        if (ausenciasExistentes.length > 0) {
            throw new AppError("El empleado ya tiene una ausencia registrada en ese período", 400)
        }

        const nuevaAusencia = await Ausencia.create({
            id_empleado,
            id_tipo_ausencia,
            fecha_inicio,
            fecha_fin,
        })

        const ausenciaConRelaciones = await Ausencia.findByPk(nuevaAusencia.id_ausencia, {
            include: [
                {
                    model: TipoAusencia,
                    attributes: ["id_tipo_ausencia", "nombre"],
                },
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        return res
            .status(201)
            .json(createResponse(true, "Ausencia creada correctamente", { ausencia: ausenciaConRelaciones }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { id_empleado, id_tipo_ausencia, fecha_inicio, fecha_fin } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de ausencia inválido", 400)
        }

        const ausencia = await Ausencia.findByPk(id)

        if (!ausencia) {
            throw new AppError(`Ausencia con ID ${id} no encontrada`, 404)
        }

        if (id_empleado) {
            const empleadoExiste = await Empleado.findByPk(id_empleado)
            if (!empleadoExiste) {
                throw new AppError("El empleado especificado no existe", 404)
            }
        }

        if (id_tipo_ausencia) {
            const tipoAusenciaExiste = await TipoAusencia.findByPk(id_tipo_ausencia)
            if (!tipoAusenciaExiste) {
                throw new AppError("El tipo de ausencia especificado no existe", 404)
            }
        }

        if (fecha_inicio || fecha_fin) {
            const nuevaFechaInicio = fecha_inicio || ausencia.fecha_inicio
            const nuevaFechaFin = fecha_fin || ausencia.fecha_fin

            if (new Date(nuevaFechaFin) < new Date(nuevaFechaInicio)) {
                throw new AppError("La fecha de fin debe ser posterior a la fecha de inicio", 400)
            }

            const ausenciasExistentes = await Ausencia.findAll({
                where: {
                    id_empleado: id_empleado || ausencia.id_empleado,
                    id_ausencia: { [Op.ne]: id },
                    [Op.or]: [
                        {
                            fecha_inicio: {
                                [Op.between]: [nuevaFechaInicio, nuevaFechaFin],
                            },
                        },
                        {
                            fecha_fin: {
                                [Op.between]: [nuevaFechaInicio, nuevaFechaFin],
                            },
                        },
                        {
                            [Op.and]: [{ fecha_inicio: { [Op.lte]: nuevaFechaInicio } }, { fecha_fin: { [Op.gte]: nuevaFechaFin } }],
                        },
                    ],
                },
            })

            if (ausenciasExistentes.length > 0) {
                throw new AppError("El empleado ya tiene una ausencia registrada en ese período", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["id_empleado", "id_tipo_ausencia", "fecha_inicio", "fecha_fin"])

        await ausencia.update(updateData)

        const ausenciaActualizada = await Ausencia.findByPk(id, {
            include: [
                {
                    model: TipoAusencia,
                    attributes: ["id_tipo_ausencia", "nombre"],
                },
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        return res
            .status(200)
            .json(createResponse(true, "Ausencia actualizada correctamente", { ausencia: ausenciaActualizada }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de ausencia inválido", 400)
        }

        const ausencia = await Ausencia.findByPk(id)

        if (!ausencia) {
            throw new AppError(`Ausencia con ID ${id} no encontrada`, 404)
        }

        await ausencia.destroy()

        return res.status(200).json(createResponse(true, "Ausencia eliminada correctamente"))
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
            include: [
                {
                    model: TipoAusencia,
                    attributes: ["id_tipo_ausencia", "nombre"],
                },
            ],
            order: [["fecha_inicio", "DESC"]],
        }

        const { data: ausencias, pagination } = await paginate(Ausencia, req, options)

        return res.status(200).json(
            createResponse(true, "Ausencias del empleado obtenidas correctamente", {
                ausencias,
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

module.exports = ausenciaController
