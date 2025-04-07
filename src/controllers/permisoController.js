const { Permiso } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, asyncHandler } = require("../utils/responseHelpers")
const { buildSearchClause } = require("../utils/queryBuilder")


const permisoController = {
    getAllPermisos: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const order = req.query.order || "ASC"

        const whereClause = search ? buildSearchClause(search, ["nombre", "tipo", "descripcion"]) : {}

        const permisos = await Permiso.findAll({
            where: whereClause,
            order: [
                ["nombre", order],
                ["tipo", "ASC"],
            ],
        })

        return res.status(200).json(createResponse(true, "Permisos obtenidos exitosamente", { permisos }))
    }),

    getPermisoById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de permiso inválido", 400)
        }

        const permiso = await Permiso.findByPk(id)

        if (!permiso) {
            throw new AppError(`Permiso con ID ${id} no encontrado`, 404)
        }

        return res.status(200).json(createResponse(true, "Permiso obtenido exitosamente", { permiso }))
    }),



}

module.exports = permisoController

