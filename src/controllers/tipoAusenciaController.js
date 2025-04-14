const { TipoAusencia, Ausencia, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")

const tipoAusenciaController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const order = req.query.order || "ASC"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre"])
        }

        const options = {
            where: whereClause,
            order: [["nombre", order]],
        }

        const { data: tiposAusencia, pagination } = await paginate(TipoAusencia, req, options)

        return res.status(200).json(
            createResponse(true, "Tipos de ausencia obtenidos correctamente", {
                tiposAusencia,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de tipo de ausencia inválido", 400)
        }

        const tipoAusencia = await TipoAusencia.findByPk(id)

        if (!tipoAusencia) {
            throw new AppError(`Tipo de ausencia con ID ${id} no encontrado`, 404)
        }

        const ausenciasCount = await Ausencia.count({
            where: { id_tipo_ausencia: id },
        })

        return res.status(200).json(
            createResponse(true, "Tipo de ausencia obtenido correctamente", {
                tipoAusencia,
                estadisticas: {
                    ausencias: ausenciasCount,
                },
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { nombre } = req.body

        validateFields(["nombre"], req.body)

        const tipoAusenciaExistente = await TipoAusencia.findOne({
            where: { nombre },
        })

        if (tipoAusenciaExistente) {
            throw new AppError("Ya existe un tipo de ausencia con este nombre", 400)
        }

        const nuevoTipoAusencia = await TipoAusencia.create({
            nombre,
        })

        return res
            .status(201)
            .json(createResponse(true, "Tipo de ausencia creado correctamente", { tipoAusencia: nuevoTipoAusencia }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de tipo de ausencia inválido", 400)
        }

        const tipoAusencia = await TipoAusencia.findByPk(id)

        if (!tipoAusencia) {
            throw new AppError(`Tipo de ausencia con ID ${id} no encontrado`, 404)
        }

        if (nombre && nombre !== tipoAusencia.nombre) {
            const tipoAusenciaExistente = await TipoAusencia.findOne({
                where: {
                    nombre,
                    id_tipo_ausencia: { [Op.ne]: id },
                },
            })

            if (tipoAusenciaExistente) {
                throw new AppError("Ya existe otro tipo de ausencia con este nombre", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre"])

        await tipoAusencia.update(updateData)

        return res.status(200).json(createResponse(true, "Tipo de ausencia actualizado correctamente", { tipoAusencia }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de tipo de ausencia inválido", 400)
        }

        const tipoAusencia = await TipoAusencia.findByPk(id)

        if (!tipoAusencia) {
            throw new AppError(`Tipo de ausencia con ID ${id} no encontrado`, 404)
        }

        const ausenciasAsociadas = await Ausencia.count({
            where: { id_tipo_ausencia: id },
        })

        if (ausenciasAsociadas > 0) {
            throw new AppError("No se puede eliminar el tipo de ausencia porque tiene ausencias asociadas", 400)
        }

        await tipoAusencia.destroy()

        return res.status(200).json(createResponse(true, "Tipo de ausencia eliminado correctamente"))
    }),
}

module.exports = tipoAusenciaController
