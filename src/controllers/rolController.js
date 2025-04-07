const { Rol, Permiso, Usuario, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")

const rolController = {
    getAll: asyncHandler(async (req, res) => {
        const isAdmin = req.user && req.user.id_rol === 1

        if (!isAdmin) {
            const whereClause = buildFilterClause({ id_rol: req.user.id_rol })

            const options = {
                where: whereClause,
                include: [
                    {
                        model: Permiso,
                        attributes: ["id_permiso", "nombre", "tipo"],
                        through: { attributes: [] },
                    },
                ],
            }

            const { data: roles, pagination } = await paginate(Rol, req, options)

            return res.status(200).json(
                createResponse(true, "Rol obtenido correctamente", {
                    roles,
                    pagination,
                })
            )
        }

        const search = req.query.search || ""
        const order = req.query.order || "ASC"

        const whereClause = search ? buildSearchClause(search, ["nombre", "descripcion"]) : {}

        const options = {
            where: whereClause,
            order: [["nombre", order]],
            include: [
                {
                    model: Permiso,
                    attributes: ["id_permiso", "nombre", "tipo"],
                    through: { attributes: [] },
                },
            ],
        }

        const { data: roles, pagination } = await paginate(Rol, req, options)

        return res.status(200).json(
            createResponse(true, "Roles obtenidos correctamente", {
                roles,
                pagination,
            })
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params
        const isAdmin = req.user && req.user.id_rol === 1

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de rol inválido", 400)
        }

        if (!isAdmin && req.user.id_rol !== Number.parseInt(id, 10)) {
            throw new AppError("No tiene permisos para ver este rol", 403)
        }

        const whereClause = buildFilterClause({ id_rol: id })

        const rol = await Rol.findOne({
            where: whereClause,
            include: [
                {
                    model: Permiso,
                    attributes: ["id_permiso", "nombre", "tipo", "descripcion"],
                    through: { attributes: [] },
                },
            ],
        })

        if (!rol) {
            throw new AppError(`Rol con ID ${id} no encontrado`, 404)
        }

        let estadisticas = null
        if (isAdmin) {
            const usuariosCount = await Usuario.count({
                where: { id_rol: id },
            })

            estadisticas = {
                usuarios: usuariosCount,
                permisos: rol.Permisos ? rol.Permisos.length : 0,
            }
        }

        return res.status(200).json(
            createResponse(true, "Rol obtenido correctamente", {
                rol,
                estadisticas,
            })
        )
    }),

    create: asyncHandler(async (req, res) => {
        if (req.user.id_rol !== 1) {
            throw new AppError("No tiene permisos para crear roles", 403)
        }

        const { nombre, descripcion, permisos } = req.body

        validateFields(["nombre"], req.body)

        const whereClause = buildFilterClause({ nombre })

        const rolExistente = await Rol.findOne({
            where: whereClause,
        })

        if (rolExistente) {
            throw new AppError("Ya existe un rol con este nombre", 400)
        }

        const nuevoRol = await Rol.create({
            nombre,
            descripcion,
        })

        if (permisos && Array.isArray(permisos) && permisos.length > 0) {
            const permisosExistentes = await Permiso.findAll({
                where: {
                    id_permiso: {
                        [Op.in]: permisos,
                    },
                },
            })

            if (permisosExistentes.length !== permisos.length) {
                throw new AppError("Algunos permisos especificados no existen", 400)
            }

            await nuevoRol.setPermisos(permisos)
        }

        const rolConPermisos = await Rol.findByPk(nuevoRol.id_rol, {
            include: [
                {
                    model: Permiso,
                    attributes: ["id_permiso", "nombre", "tipo"],
                    through: { attributes: [] },
                },
            ],
        })

        return res.status(201).json(createResponse(true, "Rol creado correctamente", { rol: rolConPermisos }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        if (req.user.id_rol !== 1) {
            throw new AppError("No tiene permisos para actualizar roles", 403)
        }

        const { id } = req.params
        const { nombre, descripcion, permisos } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de rol inválido", 400)
        }

        const whereClause = buildFilterClause({ id_rol: id })

        const rol = await Rol.findOne({
            where: whereClause,
        })

        if (!rol) {
            throw new AppError(`Rol con ID ${id} no encontrado`, 404)
        }

        if (nombre && nombre !== rol.nombre) {
            const rolExistente = await Rol.findOne({
                where: {
                    nombre,
                    id_rol: { [Op.ne]: id },
                },
            })

            if (rolExistente) {
                throw new AppError("Ya existe otro rol con este nombre", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre", "descripcion"])

        await rol.update(updateData)

        if (permisos && Array.isArray(permisos)) {
            if (permisos.length > 0) {
                const permisosExistentes = await Permiso.findAll({
                    where: {
                        id_permiso: {
                            [Op.in]: permisos,
                        },
                    },
                })

                if (permisosExistentes.length !== permisos.length) {
                    throw new AppError("Algunos permisos especificados no existen", 400)
                }
            }

            await rol.setPermisos(permisos)
        }

        const rolActualizado = await Rol.findByPk(id, {
            include: [
                {
                    model: Permiso,
                    attributes: ["id_permiso", "nombre", "tipo"],
                    through: { attributes: [] },
                },
            ],
        })

        return res.status(200).json(createResponse(true, "Rol actualizado correctamente", { rol: rolActualizado }))
    }),

    delete: asyncHandler(async (req, res) => {
        if (req.user.id_rol !== 1) {
            throw new AppError("No tiene permisos para eliminar roles", 403)
        }

        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de rol inválido", 400)
        }

        if (id === "1") {
            throw new AppError("No se puede eliminar el rol de administrador", 400)
        }

        const whereClause = buildFilterClause({ id_rol: id })

        const rol = await Rol.findOne({
            where: whereClause,
        })

        if (!rol) {
            throw new AppError(`Rol con ID ${id} no encontrado`, 404)
        }

        const usuariosWhereClause = buildFilterClause({ id_rol: id })

        const usuariosAsociados = await Usuario.count({
            where: usuariosWhereClause,
        })

        if (usuariosAsociados > 0) {
            throw new AppError("No se puede eliminar el rol porque tiene usuarios asociados", 400)
        }

        await rol.destroy()

        return res.status(200).json(createResponse(true, "Rol eliminado correctamente"))
    }),

    updatePermisos: asyncHandler(async (req, res) => {
        if (req.user.id_rol !== 1) {
            throw new AppError("No tiene permisos para modificar permisos de roles", 403)
        }

        const { id } = req.params
        const { permisos } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de rol inválido", 400)
        }

        if (!permisos || !Array.isArray(permisos)) {
            throw new AppError("Se requiere un array de permisos", 400)
        }

        const whereClause = buildFilterClause({ id_rol: id })

        const rol = await Rol.findOne({
            where: whereClause,
        })

        if (!rol) {
            throw new AppError(`Rol con ID ${id} no encontrado`, 404)
        }

        if (id === "1") {
            throw new AppError("No se pueden modificar los permisos del rol de administrador", 400)
        }

        if (permisos.length > 0) {
            const permisosExistentes = await Permiso.findAll({
                where: {
                    id_permiso: {
                        [Op.in]: permisos,
                    },
                },
            })

            if (permisosExistentes.length !== permisos.length) {
                throw new AppError("Algunos permisos especificados no existen", 400)
            }
        }

        await rol.setPermisos(permisos)

        const rolActualizado = await Rol.findByPk(id, {
            include: [
                {
                    model: Permiso,
                    attributes: ["id_permiso", "nombre", "tipo"],
                    through: { attributes: [] },
                },
            ],
        })

        return res
            .status(200)
            .json(createResponse(true, "Permisos del rol actualizados correctamente", { rol: rolActualizado }))
    }),

    getMiRol: asyncHandler(async (req, res) => {
        const idRol = req.user.id_rol

        const whereClause = buildFilterClause({ id_rol: idRol })

        const options = {
            where: whereClause,
            include: [
                {
                    model: Permiso,
                    attributes: ["id_permiso", "nombre", "tipo", "descripcion"],
                    through: { attributes: [] },
                },
            ],
        }

        const { data: roles } = await paginate(Rol, req, options)

        if (!roles || roles.length === 0) {
            throw new AppError("No se encontró el rol del usuario", 404)
        }

        return res.status(200).json(
            createResponse(true, "Rol del usuario obtenido correctamente", {
                rol: roles[0]
            })
        )
    }),


}

module.exports = rolController
