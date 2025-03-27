const { Permiso } = require("../models")
const { createResponse } = require("../utils/responseHelpers")

const permisoController = {

    getAllPermisos: async (req, res, next) => {
        try {
            const permisos = await Permiso.findAll({
                order: [
                    ["nombre", "ASC"],
                    ["tipo", "ASC"],
                ],
            })

            res.json(createResponse(true, "Permisos obtenidos exitosamente", { permisos }))
        } catch (error) {
            console.error("Error al obtener permisos:", error)
            next(error)
        }
    },

    getPermisoById: async (req, res, next) => {
        try {
            const { id } = req.params

            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de permiso inválido", null, 400))
            }

            const permiso = await Permiso.findByPk(id)

            if (!permiso) {
                return res.status(404).json(createResponse(false, `Permiso con ID ${id} no encontrado`, null, 404))
            }

            res.json(createResponse(true, "Permiso obtenido exitosamente", { permiso }))
        } catch (error) {
            console.error(`Error al obtener permiso con ID ${req.params.id}:`, error)
            next(error)
        }
    },
}

module.exports = permisoController

