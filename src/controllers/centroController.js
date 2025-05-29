const { Centro, Zona, Departamento, Empleado, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")

const centroController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const id_zona = req.query.id_zona || null
        const order = req.query.order || "ASC"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "direccion", "email"])
        }

        if (id_zona) {
            whereClause.id_zona = id_zona
        }

        const options = {
            where: whereClause,
            order: [["nombre", order]],
            include: [
                {
                    model: Zona,
                    attributes: ["id_zona", "nombre"],
                },
                {
                    model: Departamento,
                    attributes: ["id_departamento", "nombre"],
                    required: false,
                },
            ],
        }

        const { data: centros, pagination } = await paginate(Centro, req, options)

        return res.status(200).json(
            createResponse(true, "Centros obtenidos correctamente", {
                centros,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de centro inválido", 400)
        }

        const centro = await Centro.findByPk(id, {
            include: [
                {
                    model: Zona,
                    attributes: ["id_zona", "nombre"],
                },
                {
                    model: Departamento,
                    attributes: ["id_departamento", "nombre", "descripcion"],
                },
            ],
        })

        if (!centro) {
            throw new AppError(`Centro con ID ${id} no encontrado`, 404)
        }

        const [empleadosCount, departamentosCount] = await Promise.all([
            Empleado.count({ where: { id_centro: id } }),
            Departamento.count({ where: { id_centro: id } }),
        ])

        return res.status(200).json(
            createResponse(true, "Centro obtenido correctamente", {
                centro,
                estadisticas: {
                    empleados: empleadosCount,
                    departamentos: departamentosCount,
                },
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { nombre, id_zona, direccion, telefono, email } = req.body

        try {
            validateFields(["nombre", "id_zona"], req.body)
        } catch (error) {
            throw new AppError(error.message, 400, error.errors)
        }

        const zonaExiste = await Zona.findByPk(id_zona)

        if (!zonaExiste) {
            throw new AppError("La zona especificada no existe", 404)
        }

        const centroExistente = await Centro.findOne({
            where: { nombre, id_zona },
        })

        if (centroExistente) {
            throw new AppError("Ya existe un centro con este nombre en la zona seleccionada", 400)
        }

        const nuevoCentro = await Centro.create({
            nombre,
            id_zona,
            direccion,
            telefono,
            email,
        })

        const centroConZona = await Centro.findByPk(nuevoCentro.id_centro, {
            include: [
                {
                    model: Zona,
                    attributes: ["id_zona", "nombre"],
                },
            ],
        })

        return res.status(201).json(createResponse(true, "Centro creado correctamente", { centro: centroConZona }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre, id_zona } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de centro inválido", 400)
        }

        const centro = await Centro.findByPk(id)

        if (!centro) {
            throw new AppError(`Centro con ID ${id} no encontrado`, 404)
        }

        if (id_zona && id_zona !== centro.id_zona) {
            const zonaExiste = await Zona.findByPk(id_zona)

            if (!zonaExiste) {
                throw new AppError("La zona especificada no existe", 404)
            }
        }

        if ((nombre && nombre !== centro.nombre) || (id_zona && id_zona !== centro.id_zona)) {
            const centroExistente = await Centro.findOne({
                where: {
                    nombre: nombre || centro.nombre,
                    id_zona: id_zona || centro.id_zona,
                    id_centro: { [Op.ne]: id },
                },
            })

            if (centroExistente) {
                throw new AppError("Ya existe otro centro con este nombre en la zona seleccionada", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre", "id_zona", "direccion", "telefono", "email"])

        await centro.update(updateData)

        const centroActualizado = await Centro.findByPk(id, {
            include: [
                {
                    model: Zona,
                    attributes: ["id_zona", "nombre"],
                },
            ],
        })

        return res.status(200).json(createResponse(true, "Centro actualizado correctamente", { centro: centroActualizado }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de centro inválido", 400)
        }

        const centro = await Centro.findByPk(id)

        if (!centro) {
            throw new AppError(`Centro con ID ${id} no encontrado`, 404)
        }

        const [departamentosAsociados, empleadosAsociados] = await Promise.all([
            Departamento.count({ where: { id_centro: id } }),
            Empleado.count({ where: { id_centro: id } }),
        ])

        if (departamentosAsociados > 0) {
            throw new AppError("No se puede eliminar el centro porque tiene departamentos asociados", 400)
        }

        if (empleadosAsociados > 0) {
            throw new AppError("No se puede eliminar el centro porque tiene empleados asociados", 400)
        }

        await centro.destroy()

        return res.status(200).json(createResponse(true, "Centro eliminado correctamente"))
    }),

    count: asyncHandler(async (req, res) => {
        const totalCentros = await Centro.count();

        return res.status(200).json(
            createResponse(true, "Total de centros obtenido correctamente", {
                total: totalCentros
            })
        );
    }),
}

module.exports = centroController