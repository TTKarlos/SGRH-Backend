const { Usuario, Rol, Permiso, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject } = require("../utils/queryBuilder")

const userController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const activo = req.query.activo !== undefined ? req.query.activo === "true" : null
        const id_rol = req.query.id_rol || null
        const order = req.query.order || "ASC"
        const orderBy = req.query.orderBy || "nombre_usuario"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre_usuario", "email", "nombre", "apellidos"])
        }

        if (activo !== null) {
            whereClause.activo = activo
        }

        if (id_rol) {
            whereClause.id_rol = id_rol
        }

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
            include: [
                {
                    model: Rol,
                    attributes: ["id_rol", "nombre"],
                },
            ],
            attributes: { exclude: ["password_hash", "token"] },
        }

        const { data: usuarios, pagination } = await paginate(Usuario, req, options)

        return res.status(200).json(
            createResponse(true, "Usuarios obtenidos correctamente", {
                usuarios,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de usuario inválido", 400)
        }

        const usuario = await Usuario.findByPk(id, {
            include: [
                {
                    model: Rol,
                    include: [
                        {
                            model: Permiso,
                            through: { attributes: [] },
                        },
                    ],
                },
            ],
            attributes: { exclude: ["password_hash", "token"] },
        })

        if (!usuario) {
            throw new AppError(`Usuario con ID ${id} no encontrado`, 404)
        }

        return res.status(200).json(createResponse(true, "Usuario obtenido correctamente", { usuario }))
    }),

    create: asyncHandler(async (req, res) => {
        const { nombre_usuario, email, password_hash, nombre, apellidos, id_rol, activo } = req.body

        validateFields(["nombre_usuario", "email", "password_hash", "nombre", "apellidos", "id_rol"], req.body)

        const usuarioExistente = await Usuario.findOne({
            where: {
                [Op.or]: [{ nombre_usuario }, { email }],
            },
        })

        if (usuarioExistente) {
            throw new AppError("Ya existe un usuario con este nombre de usuario o email", 400)
        }

        const rolExiste = await Rol.findByPk(id_rol)
        if (!rolExiste) {
            throw new AppError("El rol especificado no existe", 404)
        }

        const nuevoUsuario = await Usuario.create({
            nombre_usuario,
            email,
            password_hash,
            nombre,
            apellidos,
            id_rol,
            activo: activo !== undefined ? activo : true,
        })

        const usuarioConRol = await Usuario.findByPk(nuevoUsuario.id_usuario, {
            include: [
                {
                    model: Rol,
                    attributes: ["id_rol", "nombre"],
                },
            ],
            attributes: { exclude: ["password_hash", "token"] },
        })

        return res.status(201).json(createResponse(true, "Usuario creado correctamente", { usuario: usuarioConRol }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre_usuario, email, nombre, apellidos, id_rol, activo } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de usuario inválido", 400)
        }

        const usuario = await Usuario.findByPk(id)

        if (!usuario) {
            throw new AppError(`Usuario con ID ${id} no encontrado`, 404)
        }

        if ((nombre_usuario && nombre_usuario !== usuario.nombre_usuario) || (email && email !== usuario.email)) {
            const usuarioExistente = await Usuario.findOne({
                where: {
                    [Op.or]: [{ nombre_usuario: nombre_usuario || "" }, { email: email || "" }],
                    id_usuario: { [Op.ne]: id },
                },
            })

            if (usuarioExistente) {
                throw new AppError("Ya existe otro usuario con este nombre de usuario o email", 400)
            }
        }

        if (id_rol && id_rol !== usuario.id_rol) {
            const rolExiste = await Rol.findByPk(id_rol)
            if (!rolExiste) {
                throw new AppError("El rol especificado no existe", 404)
            }
        }

        const updateData = buildUpdateObject(req.body, [
            "nombre_usuario",
            "email",
            "nombre",
            "apellidos",
            "id_rol",
            "activo",
        ])

        await usuario.update(updateData)

        const usuarioActualizado = await Usuario.findByPk(id, {
            include: [
                {
                    model: Rol,
                    attributes: ["id_rol", "nombre"],
                },
            ],
            attributes: { exclude: ["password_hash", "token"] },
        })

        return res
            .status(200)
            .json(createResponse(true, "Usuario actualizado correctamente", { usuario: usuarioActualizado }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de usuario inválido", 400)
        }

        if (id === "1") {
            throw new AppError("No se puede eliminar el usuario administrador", 400)
        }

        const usuario = await Usuario.findByPk(id)

        if (!usuario) {
            throw new AppError(`Usuario con ID ${id} no encontrado`, 404)
        }

        await usuario.destroy()

        return res.status(200).json(createResponse(true, "Usuario eliminado correctamente"))
    }),

    changeStatus: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { activo } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de usuario inválido", 400)
        }

        if (activo === undefined) {
            throw new AppError("El estado (activo) es requerido", 400)
        }

        if (id === "1" && activo === false) {
            throw new AppError("No se puede desactivar el usuario administrador", 400)
        }

        const usuario = await Usuario.findByPk(id)

        if (!usuario) {
            throw new AppError(`Usuario con ID ${id} no encontrado`, 404)
        }

        await usuario.update({ activo })

        return res.status(200).json(
            createResponse(true, `Usuario ${activo ? "activado" : "desactivado"} correctamente`, {
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre_usuario: usuario.nombre_usuario,
                    nombre: usuario.nombre,
                    apellidos: usuario.apellidos,
                    activo: usuario.activo,
                },
            }),
        )
    }),

    resetPassword: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { newPassword } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de usuario inválido", 400)
        }

        validateFields(["newPassword"], req.body)

        if (newPassword.length < 6) {
            throw new AppError("La nueva contraseña debe tener al menos 6 caracteres", 400)
        }

        const usuario = await Usuario.findByPk(id)

        if (!usuario) {
            throw new AppError(`Usuario con ID ${id} no encontrado`, 404)
        }

        usuario.password_hash = newPassword
        await usuario.save()

        return res.status(200).json(createResponse(true, "Contraseña restablecida correctamente"))
    }),


}

module.exports = userController

