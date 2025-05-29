const { TipoContrato, Contrato, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject } = require("../utils/queryBuilder")

const tipoContratoController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const order = req.query.order || "ASC"
        const orderBy = req.query.orderBy || "nombre"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "codigo"])
        }

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
        }

        const { data: tiposContrato, pagination } = await paginate(TipoContrato, req, options)

        return res.status(200).json(
            createResponse(true, "Tipos de contrato obtenidos correctamente", {
                tiposContrato,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de tipo de contrato inválido", 400)
        }

        const tipoContrato = await TipoContrato.findByPk(id)

        if (!tipoContrato) {
            throw new AppError(`Tipo de contrato con ID ${id} no encontrado`, 404)
        }

        const contratosCount = await Contrato.count({
            where: { id_tipo_contrato: id }
        })

        return res.status(200).json(
            createResponse(true, "Tipo de contrato obtenido correctamente", {
                tipoContrato,
                estadisticas: {
                    contratos: contratosCount
                }
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { nombre, codigo, descripcion } = req.body

        validateFields(["nombre", "codigo", "descripcion"], req.body)

        const tipoExistente = await TipoContrato.findOne({
            where: { codigo }
        })

        if (tipoExistente) {
            throw new AppError("Ya existe un tipo de contrato con este código", 400)
        }

        const nuevoTipoContrato = await TipoContrato.create({
            nombre,
            codigo,
            descripcion,
        })

        return res.status(201).json(
            createResponse(true, "Tipo de contrato creado correctamente", { tipoContrato: nuevoTipoContrato }, 201)
        )
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre, codigo } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de tipo de contrato inválido", 400)
        }

        const tipoContrato = await TipoContrato.findByPk(id)

        if (!tipoContrato) {
            throw new AppError(`Tipo de contrato con ID ${id} no encontrado`, 404)
        }

        if (codigo && codigo !== tipoContrato.codigo) {
            const tipoExistente = await TipoContrato.findOne({
                where: {
                    codigo,
                    id_tipo_contrato: { [Op.ne]: id }
                }
            })

            if (tipoExistente) {
                throw new AppError("Ya existe otro tipo de contrato con este código", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre", "codigo", "descripcion"])

        await tipoContrato.update(updateData)

        return res.status(200).json(
            createResponse(true, "Tipo de contrato actualizado correctamente", { tipoContrato })
        )
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de tipo de contrato inválido", 400)
        }

        const tipoContrato = await TipoContrato.findByPk(id)

        if (!tipoContrato) {
            throw new AppError(`Tipo de contrato con ID ${id} no encontrado`, 404)
        }

        const contratosAsociados = await Contrato.count({
            where: { id_tipo_contrato: id }
        })

        if (contratosAsociados > 0) {
            throw new AppError("No se puede eliminar el tipo de contrato porque tiene contratos asociados", 400)
        }

        await tipoContrato.destroy()

        return res.status(200).json(createResponse(true, "Tipo de contrato eliminado correctamente"))
    }),
}

module.exports = tipoContratoController