const { Empleado, Departamento, Centro, Zona } = require("../models")
const { createResponse } = require("../utils/responseHelpers")
const { Op } = require("sequelize")

const empleadoController = {

    getAll: async (req, res, next) => {
        try {
            const page = Number.parseInt(req.query.page, 10) || 1
            const limit = Number.parseInt(req.query.limit, 10) || 10
            const offset = (page - 1) * limit

            const filter = {}

            if (req.query.activo !== undefined) {
                filter.activo = req.query.activo === "true"
            }

            if (req.query.id_departamento) {
                filter.id_departamento = req.query.id_departamento
            }

            if (req.query.id_centro) {
                filter.id_centro = req.query.id_centro
            }

            if (req.query.search) {
                filter[Op.or] = [
                    { nombre: { [Op.like]: `%${req.query.search}%` } },
                    { apellidos: { [Op.like]: `%${req.query.search}%` } },
                    { dni_nie: { [Op.like]: `%${req.query.search}%` } },
                    { email: { [Op.like]: `%${req.query.search}%` } },
                ]
            }

            const { count, rows: empleados } = await Empleado.findAndCountAll({
                where: filter,
                limit,
                offset,
                include: [
                    {
                        model: Departamento,
                        include: [
                            {
                                model: Centro,
                                include: [Zona],
                            },
                        ],
                    },
                    {
                        model: Centro,
                        include: [Zona],
                    },
                ],
                order: [
                    ["apellidos", "ASC"],
                    ["nombre", "ASC"],
                ],
            })

            const totalPages = Math.ceil(count / limit)

            res.status(200).json(
                createResponse(true, "Empleados encontrados exitosamente", {
                    empleados,
                    pagination: {
                        total: count,
                        page,
                        limit,
                        totalPages,
                        hasMore: page < totalPages,
                    },
                }),
            )
        } catch (error) {
            console.error("Error al obtener empleados:", error)
            next(error)
        }
    },


    getById: async (req, res, next) => {
        try {
            const { id } = req.params

            // Validate ID
            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de empleado inválido", null, 400))
            }

            const empleado = await Empleado.findByPk(id, {
                include: [
                    {
                        model: Departamento,
                        include: [
                            {
                                model: Centro,
                                include: [Zona],
                            },
                        ],
                    },
                    {
                        model: Centro,
                        include: [Zona],
                    },
                ],
            })

            if (!empleado) {
                return res.status(404).json(createResponse(false, `Empleado con ID ${id} no encontrado`, null, 404))
            }

            res.status(200).json(createResponse(true, "Empleado encontrado exitosamente", { empleado }))
        } catch (error) {
            console.error(`Error al obtener empleado con ID ${req.params.id}:`, error)
            next(error)
        }
    },

    create: async (req, res, next) => {
        try {
            const {
                nombre,
                apellidos,
                fecha_nacimiento,
                dni_nie,
                direccion,
                telefono,
                email,
                estado_civil,
                id_departamento,
                id_centro,
                puesto_actual,
                fecha_incorporacion,
                activo,
            } = req.body

            if (!nombre || !apellidos || !dni_nie) {
                return res
                    .status(400)
                    .json(createResponse(false, "Los campos nombre, apellidos y dni_nie son obligatorios", null, 400))
            }

            const existingEmpleado = await Empleado.findOne({
                where: { dni_nie },
            })

            if (existingEmpleado) {
                return res.status(400).json(createResponse(false, `Ya existe un empleado con el DNI/NIE ${dni_nie}`, null, 400))
            }

            if (id_departamento) {
                const departamento = await Departamento.findByPk(id_departamento)
                if (!departamento) {
                    return res
                        .status(400)
                        .json(createResponse(false, `El departamento con ID ${id_departamento} no existe`, null, 400))
                }
            }

            if (id_centro) {
                const centro = await Centro.findByPk(id_centro)
                if (!centro) {
                    return res.status(400).json(createResponse(false, `El centro con ID ${id_centro} no existe`, null, 400))
                }
            }

            const empleado = await Empleado.create({
                nombre,
                apellidos,
                fecha_nacimiento,
                dni_nie,
                direccion,
                telefono,
                email,
                estado_civil,
                id_departamento,
                id_centro,
                puesto_actual,
                fecha_incorporacion,
                activo: activo !== undefined ? activo : true,
            })

            const createdEmpleado = await Empleado.findByPk(empleado.id_empleado, {
                include: [
                    {
                        model: Departamento,
                        include: [
                            {
                                model: Centro,
                                include: [Zona],
                            },
                        ],
                    },
                    {
                        model: Centro,
                        include: [Zona],
                    },
                ],
            })

            res.status(201).json(createResponse(true, "Empleado creado exitosamente", { empleado: createdEmpleado }, 201))
        } catch (error) {
            console.error("Error al crear empleado:", error)
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params
            const {
                nombre,
                apellidos,
                fecha_nacimiento,
                dni_nie,
                direccion,
                telefono,
                email,
                estado_civil,
                id_departamento,
                id_centro,
                puesto_actual,
                fecha_incorporacion,
                activo,
            } = req.body

            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de empleado inválido", null, 400))
            }

            const empleado = await Empleado.findByPk(id)
            if (!empleado) {
                return res.status(404).json(createResponse(false, `Empleado con ID ${id} no encontrado`, null, 404))
            }

            if (dni_nie && dni_nie !== empleado.dni_nie) {
                const existingEmpleado = await Empleado.findOne({
                    where: {
                        dni_nie,
                        id_empleado: { [Op.ne]: id },
                    },
                })

                if (existingEmpleado) {
                    return res
                        .status(400)
                        .json(createResponse(false, `Ya existe otro empleado con el DNI/NIE ${dni_nie}`, null, 400))
                }
            }

            if (id_departamento) {
                const departamento = await Departamento.findByPk(id_departamento)
                if (!departamento) {
                    return res
                        .status(400)
                        .json(createResponse(false, `El departamento con ID ${id_departamento} no existe`, null, 400))
                }
            }

            if (id_centro) {
                const centro = await Centro.findByPk(id_centro)
                if (!centro) {
                    return res.status(400).json(createResponse(false, `El centro con ID ${id_centro} no existe`, null, 400))
                }
            }

            const updateData = {}
            if (nombre !== undefined) updateData.nombre = nombre
            if (apellidos !== undefined) updateData.apellidos = apellidos
            if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento
            if (dni_nie !== undefined) updateData.dni_nie = dni_nie
            if (direccion !== undefined) updateData.direccion = direccion
            if (telefono !== undefined) updateData.telefono = telefono
            if (email !== undefined) updateData.email = email
            if (estado_civil !== undefined) updateData.estado_civil = estado_civil
            if (id_departamento !== undefined) updateData.id_departamento = id_departamento
            if (id_centro !== undefined) updateData.id_centro = id_centro
            if (puesto_actual !== undefined) updateData.puesto_actual = puesto_actual
            if (fecha_incorporacion !== undefined) updateData.fecha_incorporacion = fecha_incorporacion
            if (activo !== undefined) updateData.activo = activo

            await empleado.update(updateData)

            const updatedEmpleado = await Empleado.findByPk(id, {
                include: [
                    {
                        model: Departamento,
                        include: [
                            {
                                model: Centro,
                                include: [Zona],
                            },
                        ],
                    },
                    {
                        model: Centro,
                        include: [Zona],
                    },
                ],
            })

            res.status(200).json(createResponse(true, "Empleado actualizado exitosamente", { empleado: updatedEmpleado }))
        } catch (error) {
            console.error(`Error al actualizar empleado con ID ${req.params.id}:`, error)
            next(error)
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params

            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de empleado inválido", null, 400))
            }

            const empleado = await Empleado.findByPk(id)
            if (!empleado) {
                return res.status(404).json(createResponse(false, `Empleado con ID ${id} no encontrado`, null, 404))
            }

            await empleado.destroy()

            res.status(200).json(createResponse(true, `Empleado con ID ${id} eliminado exitosamente`))
        } catch (error) {
            console.error(`Error al eliminar empleado con ID ${req.params.id}:`, error)
            next(error)
        }
    },


    changeStatus: async (req, res, next) => {
        try {
            const { id } = req.params
            const { activo } = req.body

            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de empleado inválido", null, 400))
            }

            if (activo === undefined) {
                return res.status(400).json(createResponse(false, "El estado del empleado es requerido", null, 400))
            }

            const empleado = await Empleado.findByPk(id)
            if (!empleado) {
                return res.status(404).json(createResponse(false, `Empleado con ID ${id} no encontrado`, null, 404))
            }

            await empleado.update({ activo })

            res
                .status(200)
                .json(createResponse(true, `Empleado ${activo ? "activado" : "desactivado"} exitosamente`, { empleado }))
        } catch (error) {
            console.error(`Error al cambiar estado de empleado con ID ${req.params.id}:`, error)
            next(error)
        }
    },
}

module.exports = empleadoController

