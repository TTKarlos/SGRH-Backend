const { Departamento, Centro, Empleado, Op } = require("../models")
const sequelize = require("../models")
const departamentoController = {

    getAll: async (req, res) => {
        try {
            const {
                id_centro,
                nombre,
                page = 1,
                limit = 10,
                sort = "nombre",
                order = "ASC"
            } = req.query

            const where = {}
            if (id_centro) where.id_centro = id_centro
            if (nombre) where.nombre = { [Op.like]: `%${nombre}%` }

            const offset = (page - 1) * limit

            const { count, rows } = await Departamento.findAndCountAll({
                where,
                include: [
                    {
                        model: Centro,
                        attributes: ["id_centro", "nombre"]
                    }
                ],
                order: [[sort, order]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })

            const totalPages = Math.ceil(count / limit)

            return res.status(200).json({
                success: true,
                data: {
                    departamentos: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages
                    }
                }
            })
        } catch (error) {
            console.error("Error al obtener departamentos:", error)
            return res.status(500).json({
                success: false,
                message: "Error al obtener los departamentos",
                error: error.message
            })
        }
    },


    getById: async (req, res) => {
        try {
            const { id } = req.params

            const departamento = await Departamento.findByPk(id, {
                include: [
                    {
                        model: Centro,
                        attributes: ["id_centro", "nombre"]
                    },
                    {
                        model: Empleado,
                        attributes: ["id_empleado", "nombre", "apellidos", "puesto_actual", "activo"]
                    }
                ]
            })

            if (!departamento) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró el departamento con ID ${id}`
                })
            }

            return res.status(200).json({
                success: true,
                data: {
                    departamento
                }
            })
        } catch (error) {
            console.error(`Error al obtener departamento con ID ${req.params.id}:`, error)
            return res.status(500).json({
                success: false,
                message: "Error al obtener el departamento",
                error: error.message
            })
        }
    },


    create: async (req, res) => {
        try {
            const { id_centro, nombre, descripcion } = req.body

            const centroExiste = await Centro.findByPk(id_centro)
            if (!centroExiste) {
                return res.status(400).json({
                    success: false,
                    message: `El centro con ID ${id_centro} no existe`
                })
            }

            const departamentoExistente = await Departamento.findOne({
                where: {
                    nombre,
                    id_centro
                }
            })

            if (departamentoExistente) {
                return res.status(400).json({
                    success: false,
                    message: `Ya existe un departamento con el nombre "${nombre}" en este centro`
                })
            }

            const nuevoDepartamento = await Departamento.create({
                id_centro,
                nombre,
                descripcion
            })

            return res.status(201).json({
                success: true,
                message: "Departamento creado correctamente",
                data: {
                    departamento: nuevoDepartamento
                }
            })
        } catch (error) {
            console.error("Error al crear departamento:", error)
            return res.status(500).json({
                success: false,
                message: "Error al crear el departamento",
                error: error.message
            })
        }
    },


    update: async (req, res) => {
        try {
            const { id } = req.params
            const { id_centro, nombre, descripcion } = req.body

            const departamento = await Departamento.findByPk(id)
            if (!departamento) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró el departamento con ID ${id}`
                })
            }

            if (id_centro && id_centro !== departamento.id_centro) {
                const centroExiste = await Centro.findByPk(id_centro)
                if (!centroExiste) {
                    return res.status(400).json({
                        success: false,
                        message: `El centro con ID ${id_centro} no existe`
                    })
                }
            }

            if (nombre && nombre !== departamento.nombre) {
                const departamentoExistente = await Departamento.findOne({
                    where: {
                        nombre,
                        id_centro: id_centro || departamento.id_centro,
                        id_departamento: { [Op.ne]: id }
                    }
                })

                if (departamentoExistente) {
                    return res.status(400).json({
                        success: false,
                        message: `Ya existe un departamento con el nombre "${nombre}" en este centro`
                    })
                }
            }

            await departamento.update({
                id_centro: id_centro || departamento.id_centro,
                nombre: nombre || departamento.nombre,
                descripcion: descripcion !== undefined ? descripcion : departamento.descripcion
            })

            const departamentoActualizado = await Departamento.findByPk(id, {
                include: [
                    {
                        model: Centro,
                        attributes: ["id_centro", "nombre"]
                    }
                ]
            })

            return res.status(200).json({
                success: true,
                message: "Departamento actualizado correctamente",
                data: {
                    departamento: departamentoActualizado
                }
            })
        } catch (error) {
            console.error(`Error al actualizar departamento con ID ${req.params.id}:`, error)
            return res.status(500).json({
                success: false,
                message: "Error al actualizar el departamento",
                error: error.message
            })
        }
    },


    delete: async (req, res) => {
        try {
            const { id } = req.params

            const departamento = await Departamento.findByPk(id)
            if (!departamento) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró el departamento con ID ${id}`
                })
            }

            const empleadosAsociados = await Empleado.count({
                where: { id_departamento: id }
            })

            if (empleadosAsociados > 0) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede eliminar el departamento porque tiene ${empleadosAsociados} empleado(s) asociado(s)`
                })
            }

            await departamento.destroy()

            return res.status(200).json({
                success: true,
                message: "Departamento eliminado correctamente"
            })
        } catch (error) {
            console.error(`Error al eliminar departamento con ID ${req.params.id}:`, error)
            return res.status(500).json({
                success: false,
                message: "Error al eliminar el departamento",
                error: error.message
            })
        }
    },

}

module.exports = departamentoController