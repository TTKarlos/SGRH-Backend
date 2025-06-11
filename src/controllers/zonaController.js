const { Zona, Centro, Empleado, sequelize, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject } = require("../utils/queryBuilder")

const zonaController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const order = req.query.order || "ASC"

        const whereClause = search ? buildSearchClause(search, ["nombre", "descripcion"]) : {}

        const options = {
            where: whereClause,
            order: [["nombre", order]],
            include: [
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                    required: false,
                },
            ],
        }

        const { data: zonas, pagination } = await paginate(Zona, req, options)

        return res.status(200).json(
            createResponse(true, "Zonas obtenidas correctamente", {
                zonas,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de zona inválido", 400)
        }

        const zona = await Zona.findByPk(id, {
            include: [
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre", "direccion", "telefono", "email"],
                },
            ],
        })

        if (!zona) {
            throw new AppError(`Zona con ID ${id} no encontrada`, 404)
        }

        return res.status(200).json(createResponse(true, "Zona obtenida correctamente", { zona }))
    }),

    create: asyncHandler(async (req, res) => {
        const { nombre, descripcion } = req.body

        try {
            validateFields(["nombre"], req.body)
        } catch (error) {
            throw new AppError(error.message, 400, error.errors)
        }

        const zonaExistente = await Zona.findOne({
            where: { nombre },
        })

        if (zonaExistente) {
            throw new AppError("Ya existe una zona con este nombre", 400)
        }

        const nuevaZona = await Zona.create({ nombre, descripcion })

        return res.status(201).json(createResponse(true, "Zona creada correctamente", { zona: nuevaZona }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de zona inválido", 400)
        }

        const zona = await Zona.findByPk(id)

        if (!zona) {
            throw new AppError(`Zona con ID ${id} no encontrada`, 404)
        }

        if (nombre && nombre !== zona.nombre) {
            const zonaExistente = await Zona.findOne({
                where: {
                    nombre,
                    id_zona: { [Op.ne]: id },
                },
            })

            if (zonaExistente) {
                throw new AppError("Ya existe otra zona con este nombre", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre", "descripcion"])

        await zona.update(updateData)

        const zonaActualizada = await Zona.findByPk(id)

        return res.status(200).json(createResponse(true, "Zona actualizada correctamente", { zona: zonaActualizada }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de zona inválido", 400)
        }

        const zona = await Zona.findByPk(id)

        if (!zona) {
            throw new AppError(`Zona con ID ${id} no encontrada`, 404)
        }

        const centrosAsociados = await Centro.count({ where: { id_zona: id } })

        if (centrosAsociados > 0) {
            throw new AppError("No se puede eliminar la zona porque tiene centros asociados", 400)
        }

        await zona.destroy()

        return res.status(200).json(createResponse(true, "Zona eliminada correctamente"))
    }),

    count: asyncHandler(async (req, res) => {
        const totalZonas = await Zona.count()

        return res.status(200).json(
            createResponse(true, "Total de zonas obtenido correctamente", {
                total: totalZonas,
            }),
        )
    }),

    getChartData: asyncHandler(async (req, res) => {
        const empleadosPorZona = await Empleado.findAll({
            attributes: [
                [sequelize.col("centro.zona.id_zona"), "id"],
                [sequelize.col("centro.zona.nombre"), "nombre"],
                [sequelize.fn("COUNT", sequelize.col("Empleado.id_empleado")), "total"],
            ],
            include: [
                {
                    model: Centro,
                    as: "centro",
                    attributes: [],
                    required: true,
                    include: [
                        {
                            model: Zona,
                            as: "zona",
                            attributes: [],
                            required: true,
                        },
                    ],
                },
            ],
            where: {
                activo: true,
            },
            group: ["centro.zona.id_zona", "centro.zona.nombre"],
            order: [[sequelize.literal("total"), "DESC"]],
            raw: true,
        })

        const formattedData = empleadosPorZona.map((item) => ({
            id: item.id,
            name: item.nombre || "Sin zona",
            count: Number.parseInt(item.total) || 0,
        }))

        return res.status(200).json(
            createResponse(true, "Datos de gráfica de zonas obtenidos correctamente", {
                data: formattedData,
            }),
        )
    }),
}

module.exports = zonaController
