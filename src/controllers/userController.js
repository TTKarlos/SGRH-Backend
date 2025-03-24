// Fix the import statement - import from models index, not from Usuario model
const { Usuario, Rol, sequelize } = require("../models")
const { createResponse, validateFields } = require("../utils/responseHelpers")
const { ROLES } = require("../utils/constants")

const userController = {
    getAll: async (req, res, next) => {
        try {
            const page = Number.parseInt(req.query.page, 10) || 1
            const limit = Number.parseInt(req.query.limit, 10) || 10
            const offset = (page - 1) * limit
            const filter = {}
            if (req.query.activo !== undefined) {
                filter.activo = req.query.activo === "true"
            }
            if (req.query.id_rol) {
                filter.id_rol = req.query.id_rol
            }
            if (req.query.search) {
                filter[sequelize.Op.or] = [
                    { nombre_usuario: { [sequelize.Op.like]: `%${req.query.search}%` } },
                    { email: { [sequelize.Op.like]: `%${req.query.search}%` } },
                    { nombre: { [sequelize.Op.like]: `%${req.query.search}%` } },
                    { apellidos: { [sequelize.Op.like]: `%${req.query.search}%` } },
                ]
            }
            const { count, rows: users } = await Usuario.findAndCountAll({
                where: filter,
                limit,
                offset,
                include: [{ model: Rol, attributes: ["id_rol", "nombre", "descripcion"] }],
                order: [["id_usuario", "ASC"]],
            })
            const totalPages = Math.ceil(count / limit)
            res.status(200).json(
                createResponse(true, "Usuarios encontrados exitosamente", {
                    users,
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
            console.error("Error al obtener usuarios:", error)
            next(error)
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params

            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de usuario inválido", null, 400))
            }
            const user = await Usuario.findByPk(id, {
                include: [{ model: Rol, attributes: ["id_rol", "nombre", "descripcion"] }],
            })
            if (!user) {
                return res.status(404).json(createResponse(false, `Usuario con ID ${id} no encontrado`, null, 404))
            }
            res.status(200).json(createResponse(true, "Usuario encontrado exitosamente", { user }))
        } catch (error) {
            console.error(`Error al obtener usuario con ID ${req.params.id}:`, error)
            next(error)
        }
    },

    create: async (req, res, next) => {
        try {
            const { nombre_usuario, email, password_hash, nombre, apellidos, id_rol } = req.body
            try {
                validateFields(["nombre_usuario", "email", "password_hash", "nombre", "apellidos"], req.body)
            } catch (error) {
                return res.status(400).json(createResponse(false, error.message, null, 400))
            }
            const existingUser = await Usuario.findOne({
                where: {
                    [sequelize.Op.or]: [{ nombre_usuario }, { email }],
                },
            })
            if (existingUser) {
                return res
                    .status(400)
                    .json(createResponse(false, "El usuario o el correo electrónico ya están registrados", null, 400))
            }
            const user = await Usuario.create({
                nombre_usuario,
                email,
                password_hash,
                nombre,
                apellidos,
                id_rol: id_rol || 4,
                activo: true,
            })
            const createdUser = await Usuario.findByPk(user.id_usuario, {
                include: [{ model: Rol, attributes: ["id_rol", "nombre", "descripcion"] }],
            })
            res.status(201).json(createResponse(true, "Usuario creado exitosamente", { user: createdUser }, 201))
        } catch (error) {
            console.error("Error al crear usuario:", error)
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params
            const { nombre_usuario, email, password_hash, nombre, apellidos, id_rol, activo, ...otherUpdates } = req.body
            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de usuario inválido", null, 400))
            }
            const user = await Usuario.findByPk(id)
            if (!user) {
                return res.status(404).json(createResponse(false, `Usuario con ID ${id} no encontrado`, null, 404))
            }
            if (nombre_usuario || email) {
                const existingUser = await Usuario.findOne({
                    where: {
                        [sequelize.Op.or]: [nombre_usuario ? { nombre_usuario } : null, email ? { email } : null].filter(Boolean),
                        id_usuario: { [sequelize.Op.ne]: id },
                    },
                })
                if (existingUser) {
                    return res
                        .status(400)
                        .json(
                            createResponse(
                                false,
                                "El nombre de usuario o el correo electrónico ya están registrados por otro usuario",
                                null,
                                400,
                            ),
                        )
                }
            }
            const updateData = {}
            if (nombre_usuario) updateData.nombre_usuario = nombre_usuario
            if (email) updateData.email = email
            if (nombre) updateData.nombre = nombre
            if (apellidos) updateData.apellidos = apellidos
            if (id_rol) updateData.id_rol = id_rol
            if (activo !== undefined) updateData.activo = activo

            if (password_hash) {
                updateData.password_hash = password_hash
            }
            await user.update(updateData)
            const updatedUser = await Usuario.findByPk(id, {
                include: [{ model: Rol, attributes: ["id_rol", "nombre", "descripcion"] }],
            })
            res.status(200).json(createResponse(true, "Usuario actualizado exitosamente", { user: updatedUser }))
        } catch (error) {
            console.error(`Error al actualizar usuario con ID ${req.params.id}:`, error)
            next(error)
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params
            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de usuario inválido", null, 400))
            }
            const user = await Usuario.findByPk(id)
            if (!user) {
                return res.status(404).json(createResponse(false, `Usuario con ID ${id} no encontrado`, null, 404))
            }
            if (user.id_rol === 1) {
                const adminCount = await Usuario.count({
                    where: {
                        id_rol: 1,
                        activo: true,
                    },
                })
                if (adminCount <= 1) {
                    return res
                        .status(400)
                        .json(createResponse(false, "No se puede eliminar el último administrador del sistema", null, 400))
                }
            }
            await user.destroy()
            res.status(200).json(createResponse(true, `Usuario con ID ${id} eliminado exitosamente`))
        } catch (error) {
            console.error(`Error al eliminar usuario con ID ${req.params.id}:`, error)
            next(error)
        }
    },

    changeStatus: async (req, res, next) => {
        try {
            const { id } = req.params
            const { activo } = req.body
            if (!id || isNaN(Number.parseInt(id, 10))) {
                return res.status(400).json(createResponse(false, "ID de usuario inválido", null, 400))
            }
            if (activo === undefined) {
                return res.status(400).json(createResponse(false, "El estado del usuario es requerido", null, 400))
            }
            const user = await Usuario.findByPk(id)
            if (!user) {
                return res.status(404).json(createResponse(false, `Usuario con ID ${id} no encontrado`, null, 404))
            }
            if (user.id_rol === 1 && !activo) {
                const adminCount = await Usuario.count({
                    where: {
                        id_rol: 1,
                        activo: true,
                    },
                })
                if (adminCount <= 1) {
                    return res
                        .status(400)
                        .json(createResponse(false, "No se puede desactivar el último administrador del sistema", null, 400))
                }
            }
            await user.update({ activo })
            res
                .status(200)
                .json(createResponse(true, `Usuario ${activo ? "activado" : "desactivado"} exitosamente`, { user }))
        } catch (error) {
            console.error(`Error al cambiar estado de usuario con ID ${req.params.id}:`, error)
            next(error)
        }
    },
}

module.exports = userController

