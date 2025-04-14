const { FormacionEmpleado, Empleado, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")

const formacionEmpleadoController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const id_empleado = req.query.id_empleado || null
        const es_interna = req.query.es_interna !== undefined ? req.query.es_interna === "true" : null
        const fecha_inicio = req.query.fecha_inicio || null
        const fecha_fin = req.query.fecha_fin || null
        const order = req.query.order || "DESC"
        const orderBy = req.query.orderBy || "fecha_inicio"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre"])
        }

        const filtros = buildFilterClause({
            id_empleado,
            es_interna,
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
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        }

        const { data: formaciones, pagination } = await paginate(FormacionEmpleado, req, options)

        return res.status(200).json(
            createResponse(true, "Formaciones obtenidas correctamente", {
                formaciones,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de formación inválido", 400)
        }

        const formacion = await FormacionEmpleado.findByPk(id, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        if (!formacion) {
            throw new AppError(`Formación con ID ${id} no encontrada`, 404)
        }

        return res.status(200).json(
            createResponse(true, "Formación obtenida correctamente", {
                formacion,
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { id_empleado, nombre, es_interna, fecha_inicio, fecha_fin } = req.body

        validateFields(["id_empleado", "nombre", "fecha_inicio"], req.body)

        const empleadoExiste = await Empleado.findByPk(id_empleado)
        if (!empleadoExiste) {
            throw new AppError("El empleado especificado no existe", 404)
        }

        if (fecha_fin && new Date(fecha_fin) < new Date(fecha_inicio)) {
            throw new AppError("La fecha de fin debe ser posterior a la fecha de inicio", 400)
        }

        const nuevaFormacion = await FormacionEmpleado.create({
            id_empleado,
            nombre,
            es_interna: es_interna !== undefined ? es_interna : false,
            fecha_inicio,
            fecha_fin,
        })

        const formacionConRelaciones = await FormacionEmpleado.findByPk(nuevaFormacion.id_formacion, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        return res
            .status(201)
            .json(createResponse(true, "Formación creada correctamente", { formacion: formacionConRelaciones }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { id_empleado, nombre, es_interna, fecha_inicio, fecha_fin } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de formación inválido", 400)
        }

        const formacion = await FormacionEmpleado.findByPk(id)

        if (!formacion) {
            throw new AppError(`Formación con ID ${id} no encontrada`, 404)
        }

        if (id_empleado) {
            const empleadoExiste = await Empleado.findByPk(id_empleado)
            if (!empleadoExiste) {
                throw new AppError("El empleado especificado no existe", 404)
            }
        }

        if (fecha_inicio || fecha_fin) {
            const nuevaFechaInicio = fecha_inicio || formacion.fecha_inicio
            const nuevaFechaFin = fecha_fin || formacion.fecha_fin

            if (nuevaFechaFin && new Date(nuevaFechaFin) < new Date(nuevaFechaInicio)) {
                throw new AppError("La fecha de fin debe ser posterior a la fecha de inicio", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["id_empleado", "nombre", "es_interna", "fecha_inicio", "fecha_fin"])

        await formacion.update(updateData)

        const formacionActualizada = await FormacionEmpleado.findByPk(id, {
            include: [
                {
                    model: Empleado,
                    attributes: ["id_empleado", "nombre", "apellidos", "dni_nie"],
                },
            ],
        })

        return res
            .status(200)
            .json(createResponse(true, "Formación actualizada correctamente", { formacion: formacionActualizada }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de formación inválido", 400)
        }

        const formacion = await FormacionEmpleado.findByPk(id)

        if (!formacion) {
            throw new AppError(`Formación con ID ${id} no encontrada`, 404)
        }

        await formacion.destroy()

        return res.status(200).json(createResponse(true, "Formación eliminada correctamente"))
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
            order: [["fecha_inicio", "DESC"]],
        }

        const { data: formaciones, pagination } = await paginate(FormacionEmpleado, req, options)

        return res.status(200).json(
            createResponse(true, "Formaciones del empleado obtenidas correctamente", {
                formaciones,
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

module.exports = formacionEmpleadoController
