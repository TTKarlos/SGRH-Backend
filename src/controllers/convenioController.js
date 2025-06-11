const { Convenio, CategoriaConvenio, Contrato, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause } = require("../utils/queryBuilder")

const convenioController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const order = req.query.order || "ASC"
        const orderBy = req.query.orderBy || "nombre"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "numero_convenio"])
        }

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
        }

        const { data: convenios, pagination } = await paginate(Convenio, req, options)

        return res.status(200).json(
            createResponse(true, "Convenios obtenidos correctamente", {
                convenios,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de convenio inválido", 400)
        }

        const convenio = await Convenio.findByPk(id, {
            include: [
                {
                    model: CategoriaConvenio,
                    attributes: ["id_categoria", "nombre", "descripcion"],
                },
            ],
        })

        if (!convenio) {
            throw new AppError(`Convenio con ID ${id} no encontrado`, 404)
        }

        const contratosCount = await Contrato.count({
            where: { id_convenio: id },
        })

        return res.status(200).json(
            createResponse(true, "Convenio obtenido correctamente", {
                convenio,
                estadisticas: {
                    categorias: convenio.CategoriaConvenios ? convenio.CategoriaConvenios.length : 0,
                    contratos: contratosCount,
                },
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { nombre, numero_convenio, descripcion,codigo } = req.body

        validateFields(["descripcion","nombre","codigo"], req.body)

        if (numero_convenio) {
            const convenioExistente = await Convenio.findOne({
                where: { numero_convenio },
            })

            if (convenioExistente) {
                throw new AppError("Ya existe un convenio con este número", 400)
            }
        }

        const nuevoConvenio = await Convenio.create({
            nombre: nombre.trim(),
            numero_convenio: numero_convenio ? numero_convenio.trim() : null,
            descripcion: descripcion ? descripcion.trim() : null,
            codigo: codigo.trim(),
        })

        return res.status(201).json(createResponse(true, "Convenio creado correctamente", { convenio: nuevoConvenio }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre, numero_convenio, descripcion, codigo } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de convenio inválido", 400)
        }

        const convenio = await Convenio.findByPk(id)

        if (!convenio) {
            throw new AppError(`Convenio con ID ${id} no encontrado`, 404)
        }

        if (numero_convenio && numero_convenio !== convenio.numero_convenio) {
            const convenioExistente = await Convenio.findOne({
                where: {
                    numero_convenio,
                    id_convenio: { [Op.ne]: id },
                },
            })

            if (convenioExistente) {
                throw new AppError("Ya existe otro convenio con este número", 400)
            }
        }

        const updateData = {}

        if (nombre !== undefined) {
            updateData.nombre = nombre.trim()
        }

        if (numero_convenio !== undefined) {
            updateData.numero_convenio = numero_convenio ? numero_convenio.trim() : null
        }

        if (descripcion !== undefined) {
            updateData.descripcion = descripcion ? descripcion.trim() : null
        }

        if (codigo !== undefined) {
            updateData.codigo = codigo ? codigo.trim() : null
        }

        console.log("Datos de actualización:", updateData)

        await convenio.update(updateData)

        const convenioActualizado = await Convenio.findByPk(id)

        console.log("Convenio actualizado:", convenioActualizado.toJSON())

        return res
            .status(200)
            .json(createResponse(true, "Convenio actualizado correctamente", { convenio: convenioActualizado }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de convenio inválido", 400)
        }

        const convenio = await Convenio.findByPk(id)

        if (!convenio) {
            throw new AppError(`Convenio con ID ${id} no encontrado`, 404)
        }

        const categoriasAsociadas = await CategoriaConvenio.count({
            where: { id_convenio: id },
        })

        if (categoriasAsociadas > 0) {
            throw new AppError("No se puede eliminar el convenio porque tiene categorías asociadas", 400)
        }

        const contratosAsociados = await Contrato.count({
            where: { id_convenio: id },
        })

        if (contratosAsociados > 0) {
            throw new AppError("No se puede eliminar el convenio porque tiene contratos asociados", 400)
        }

        await convenio.destroy()

        return res.status(200).json(createResponse(true, "Convenio eliminado correctamente"))
    }),

    getCategorias: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de convenio inválido", 400)
        }

        const convenio = await Convenio.findByPk(id)

        if (!convenio) {
            throw new AppError(`Convenio con ID ${id} no encontrado`, 404)
        }

        const categorias = await CategoriaConvenio.findAll({
            where: { id_convenio: id },
            order: [["nombre", "ASC"]],
        })

        return res.status(200).json(
            createResponse(true, "Categorías del convenio obtenidas correctamente", {
                categorias,
                convenio: {
                    id_convenio: convenio.id_convenio,
                    nombre: convenio.nombre,
                    numero_convenio: convenio.numero_convenio,
                },
            }),
        )
    }),
}

module.exports = convenioController
