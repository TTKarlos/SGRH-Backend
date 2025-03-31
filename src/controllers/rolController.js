const Rol = require("../models/Rol")
const Permiso = require("../models/Permiso")
const sequelize = require("../models")
const { createResponse } = require("../utils/responseHelpers")
const { ROLES } = require("../utils/constants")

const rolController = {
    getAllRoles: async (req, res, next) => {
        try {
            const includeOptions = {
                include: {
                    model: Permiso,
                    through: { attributes: [] },
                },
                order: [["nombre", "ASC"]],
            }

            let roles

            if (req.user.id_rol === 1) {
                roles = await Rol.findAll(includeOptions)
            } else {
                const userRole = await Rol.findByPk(req.user.id_rol, includeOptions)

                if (!userRole) {
                    return res.status(404).json(createResponse(false, "Rol no encontrado", null, 404))
                }

                roles = [userRole]
            }

            const message = req.user.id_rol === 1 ? "Roles con permisos obtenidos exitosamente" : "Rol obtenido exitosamente"

            return res.json(createResponse(true, message, { roles }))
        } catch (error) {
            console.error("Error al obtener roles:", error)
            next(error)
        }
    },

    getRolById: async (req, res, next) => {
        try {
            const { id } = req.params

            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de rol inválido", null, 400))
            }

            if (req.user.id_rol !== 1 && req.user.id_rol !== Number.parseInt(id, 10)) {
                return res.status(403).json(createResponse(false, "No tiene permiso para acceder a este rol", null, 403))
            }

            const rol = await Rol.findByPk(id, {
                include: {
                    model: Permiso,
                    through: { attributes: [] },
                },
            })

            if (!rol) {
                return res.status(404).json(createResponse(false, `Rol con ID ${id} no encontrado`, null, 404))
            }

            return res.json(createResponse(true, "Rol con permisos obtenido exitosamente", { rol }))
        } catch (error) {
            console.error(`Error al obtener rol con ID ${req.params.id}:`, error)
            next(error)
        }
    },

    createRol: async (req, res, next) => {
        try {
            const { nombre, descripcion } = req.body

            if (!nombre) {
                return res.status(400).json(createResponse(false, "El nombre del rol es requerido", null, 400))
            }

            const rolExistente = await Rol.findOne({ where: { nombre } })

            if (rolExistente) {
                return res.status(400).json(createResponse(false, `Ya existe un rol con el nombre "${nombre}"`, null, 400))
            }

            const rol = await Rol.create({ nombre, descripcion })
            return res.status(201).json(createResponse(true, "Rol creado exitosamente", { rol }, 201))
        } catch (error) {
            console.error("Error al crear rol:", error)
            next(error)
        }
    },

    updateRol: async (req, res, next) => {
        try {
            const { id } = req.params
            const { nombre, descripcion } = req.body

            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de rol inválido", null, 400))
            }

            if (!nombre) {
                return res.status(400).json(createResponse(false, "El nombre del rol es requerido", null, 400))
            }

            const rol = await Rol.findByPk(id)

            if (!rol) {
                return res.status(404).json(createResponse(false, `Rol con ID ${id} no encontrado`, null, 404))
            }

            if (rol.nombre === ROLES.ADMIN && nombre !== ROLES.ADMIN) {
                return res
                    .status(403)
                    .json(createResponse(false, "No se puede cambiar el nombre del rol de Administrador", null, 403))
            }

            if (nombre !== rol.nombre) {
                const rolExistente = await Rol.findOne({ where: { nombre } })

                if (rolExistente) {
                    return res.status(400).json(createResponse(false, `Ya existe un rol con el nombre "${nombre}"`, null, 400))
                }
            }

            await rol.update({ nombre, descripcion })
            return res.json(createResponse(true, "Rol actualizado exitosamente", { rol }))
        } catch (error) {
            console.error(`Error al actualizar rol con ID ${req.params.id}:`, error)
            next(error)
        }
    },

    deleteRol: async (req, res, next) => {
        const transaction = await sequelize.transaction()

        try {
            const { id } = req.params

            if (!id || isNaN(Number.parseInt(id, 10))) {
                await transaction.rollback()
                return res.status(400).json(createResponse(false, "ID de rol inválido", null, 400))
            }

            const rol = await Rol.findByPk(id)

            if (!rol) {
                await transaction.rollback()
                return res.status(404).json(createResponse(false, `Rol con ID ${id} no encontrado`, null, 404))
            }

            if (rol.nombre === ROLES.ADMIN) {
                await transaction.rollback()
                return res.status(403).json(createResponse(false, "No se puede eliminar el rol de Administrador", null, 403))
            }

            const usuariosConRol = await sequelize.models.Usuario.count({ where: { id_rol: id } })

            if (usuariosConRol > 0) {
                await transaction.rollback()
                return res
                    .status(400)
                    .json(
                        createResponse(
                            false,
                            `No se puede eliminar el rol porque está asignado a ${usuariosConRol} usuario(s)`,
                            null,
                            400,
                        ),
                    )
            }

            await rol.setPermisos([], { transaction })
            await rol.destroy({ transaction })
            await transaction.commit()

            return res.json(createResponse(true, "Rol eliminado exitosamente"))
        } catch (error) {
            await transaction.rollback()
            console.error(`Error al eliminar rol con ID ${req.params.id}:`, error)
            next(error)
        }
    },

    addPermisosToRol: async (req, res, next) => {
        const transaction = await sequelize.transaction()

        try {
            const { id_rol, permisos } = req.body

            if (!id_rol || !permisos || !Array.isArray(permisos) || permisos.length === 0) {
                await transaction.rollback()
                return res
                    .status(400)
                    .json(createResponse(false, "Se requiere un ID de rol y un array de IDs de permisos", null, 400))
            }

            const rol = await Rol.findByPk(id_rol)

            if (!rol) {
                await transaction.rollback()
                return res.status(404).json(createResponse(false, `Rol con ID ${id_rol} no encontrado`, null, 404))
            }

            const permisosActuales = await rol.getPermisos()
            const permisosActualesIds = permisosActuales.map((p) => p.id_permiso)

            const nuevosPermisos = permisos.filter((id) => !permisosActualesIds.includes(id))

            if (nuevosPermisos.length === 0) {
                await transaction.rollback()
                return res.status(200).json(createResponse(true, "Todos los permisos ya estaban asignados al rol", null))
            }

            await rol.addPermisos(nuevosPermisos, { transaction })
            await transaction.commit()

            const rolActualizado = await Rol.findByPk(id_rol, {
                include: {
                    model: Permiso,
                    through: { attributes: [] },
                },
            })

            return res.json(
                createResponse(true, `Permisos agregados exitosamente al rol ${rol.nombre}`, { rol: rolActualizado }),
            )
        } catch (error) {
            await transaction.rollback()
            console.error("Error al agregar permisos a rol:", error)
            next(error)
        }
    },

    removePermisosFromRol: async (req, res, next) => {
        const transaction = await sequelize.transaction()

        try {
            const { id_rol, permisos } = req.body

            if (!id_rol || !permisos || !Array.isArray(permisos) || permisos.length === 0) {
                await transaction.rollback()
                return res
                    .status(400)
                    .json(createResponse(false, "Se requiere un ID de rol y un array de IDs de permisos", null, 400))
            }

            const rol = await Rol.findByPk(id_rol)

            if (!rol) {
                await transaction.rollback()
                return res.status(404).json(createResponse(false, `Rol con ID ${id_rol} no encontrado`, null, 404))
            }

            if (rol.nombre === ROLES.ADMIN) {
                const permisosAdmin = await rol.getPermisos()

                if (permisosAdmin.length <= permisos.length) {
                    await transaction.rollback()
                    return res
                        .status(403)
                        .json(createResponse(false, "No se pueden eliminar todos los permisos del rol de Administrador", null, 403))
                }
            }

            await rol.removePermisos(permisos, { transaction })
            await transaction.commit()

            const rolActualizado = await Rol.findByPk(id_rol, {
                include: {
                    model: Permiso,
                    through: { attributes: [] },
                },
            })

            return res.json(
                createResponse(true, `Permisos eliminados exitosamente del rol ${rol.nombre}`, { rol: rolActualizado }),
            )
        } catch (error) {
            await transaction.rollback()
            console.error("Error al eliminar permisos de rol:", error)
            next(error)
        }
    },
}

module.exports = rolController

