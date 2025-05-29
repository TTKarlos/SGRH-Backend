const { CategoriaConvenio, Convenio, Contrato, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject } = require("../utils/queryBuilder")

const categoriaConvenioController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const id_convenio = req.query.id_convenio || null
        const order = req.query.order || "ASC"
        const orderBy = req.query.orderBy || "nombre"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre"])
        }

        if (id_convenio) {
            whereClause.id_convenio = id_convenio
        }

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
            include: [
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre"],
                },
            ],
        }

        const { data: categorias, pagination } = await paginate(CategoriaConvenio, req, options)

        return res.status(200).json(
            createResponse(true, "Categorías de convenio obtenidas correctamente", {
                categorias,
                pagination,
            }),
        )
    }),

    getByConvenio: asyncHandler(async (req, res) => {
        try {
            const { idConvenio } = req.params

            if (!idConvenio || isNaN(Number.parseInt(idConvenio, 10))) {
                throw new AppError("ID de convenio inválido", 400)
            }

            const convenio = await Convenio.findByPk(idConvenio)
            if (!convenio) {
                throw new AppError(`Convenio con ID ${idConvenio} no encontrado`, 404)
            }

            const categorias = await CategoriaConvenio.findAll({
                where: { id_convenio: idConvenio },
                order: [["nombre", "ASC"]],
                include: [
                    {
                        model: Convenio,
                        attributes: ["id_convenio", "nombre"],
                    },
                ],
            })

            return res.status(200).json(
                createResponse(true, `Categorías del convenio ${convenio.nombre} obtenidas correctamente`, {
                    categorias,
                    convenio: {
                        id_convenio: convenio.id_convenio,
                        nombre: convenio.nombre,
                    },
                }),
            )
        } catch (error) {
            console.error("Error en getByConvenio:", error)
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(createResponse(false, error.message, null, error.statusCode))
            }
            return res.status(500).json(
                createResponse(
                    false,
                    "Error interno del servidor al obtener categorías",
                    {
                        error: error.message,
                    },
                    500,
                ),
            )
        }
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de categoría inválido", 400)
        }

        const categoria = await CategoriaConvenio.findByPk(id, {
            include: [
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre"],
                },
            ],
        })

        if (!categoria) {
            throw new AppError(`Categoría con ID ${id} no encontrada`, 404)
        }

        const contratosCount = await Contrato.count({
            where: { id_categoria: id },
        })

        return res.status(200).json(
            createResponse(true, "Categoría de convenio obtenida correctamente", {
                categoria,
                estadisticas: {
                    contratos: contratosCount,
                },
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { id_convenio, nombre, descripcion } = req.body

        validateFields(["id_convenio", "nombre"], req.body)

        const convenio = await Convenio.findByPk(id_convenio)
        if (!convenio) {
            throw new AppError("El convenio especificado no existe", 404)
        }

        const categoriaExistente = await CategoriaConvenio.findOne({
            where: {
                id_convenio,
                nombre,
            },
        })

        if (categoriaExistente) {
            throw new AppError("Ya existe una categoría con este nombre en el convenio seleccionado", 400)
        }

        const nuevaCategoria = await CategoriaConvenio.create({
            id_convenio,
            nombre,
            descripcion,
        })

        const categoriaConRelaciones = await CategoriaConvenio.findByPk(nuevaCategoria.id_categoria, {
            include: [
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre"],
                },
            ],
        })

        return res
            .status(201)
            .json(
                createResponse(true, "Categoría de convenio creada correctamente", { categoria: categoriaConRelaciones }, 201),
            )
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { id_convenio, nombre, descripcion } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de categoría inválido", 400)
        }

        const categoria = await CategoriaConvenio.findByPk(id)

        if (!categoria) {
            throw new AppError(`Categoría con ID ${id} no encontrada`, 404)
        }

        if (id_convenio) {
            const convenio = await Convenio.findByPk(id_convenio)
            if (!convenio) {
                throw new AppError("El convenio especificado no existe", 404)
            }
        }

        if ((nombre && nombre !== categoria.nombre) || (id_convenio && id_convenio !== categoria.id_convenio)) {
            const categoriaExistente = await CategoriaConvenio.findOne({
                where: {
                    id_convenio: id_convenio || categoria.id_convenio,
                    nombre: nombre || categoria.nombre,
                    id_categoria: { [Op.ne]: id },
                },
            })

            if (categoriaExistente) {
                throw new AppError("Ya existe otra categoría con este nombre en el convenio seleccionado", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["id_convenio", "nombre", "descripcion"])

        await categoria.update(updateData)

        const categoriaActualizada = await CategoriaConvenio.findByPk(id, {
            include: [
                {
                    model: Convenio,
                    attributes: ["id_convenio", "nombre","descripcion"],
                },
            ],
        })

        return res
            .status(200)
            .json(
                createResponse(true, "Categoría de convenio actualizada correctamente", { categoria: categoriaActualizada }),
            )
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de categoría inválido", 400)
        }

        const categoria = await CategoriaConvenio.findByPk(id)

        if (!categoria) {
            throw new AppError(`Categoría con ID ${id} no encontrada`, 404)
        }

        const contratosAsociados = await Contrato.count({
            where: { id_categoria: id },
        })

        if (contratosAsociados > 0) {
            throw new AppError("No se puede eliminar la categoría porque tiene contratos asociados", 400)
        }

        await categoria.destroy()

        return res.status(200).json(createResponse(true, "Categoría de convenio eliminada correctamente"))
    }),
}

module.exports = categoriaConvenioController
