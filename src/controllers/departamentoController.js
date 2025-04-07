const { Departamento, Centro, Empleado, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")

const departamentoController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const id_centro = req.query.id_centro || null
        const activo = req.query.activo !== undefined ? req.query.activo === "true" : null
        const order = req.query.order || "ASC"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "descripcion"])
        }

        const filtros = buildFilterClause({
            id_centro,
            activo,
        })

        whereClause = { ...whereClause, ...filtros }

        const options = {
            where: whereClause,
            order: [["nombre", order]],
            include: [
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                },
            ],
        }

        const { data: departamentos, pagination } = await paginate(Departamento, req, options)

        return res.status(200).json(
            createResponse(true, "Departamentos obtenidos correctamente", {
                departamentos,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de departamento inválido", 400)
        }

        const departamento = await Departamento.findByPk(id, {
            include: [
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                },
            ],
        })

        if (!departamento) {
            throw new AppError(`Departamento con ID ${id} no encontrado`, 404)
        }

        const empleadosCount = await Empleado.count({
            where: { id_departamento: id },
        })

        return res.status(200).json(
            createResponse(true, "Departamento obtenido correctamente", {
                departamento,
                estadisticas: {
                    empleados: empleadosCount,
                },
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { nombre, id_centro, descripcion, activo } = req.body

        validateFields(["nombre", "id_centro"], req.body)

        const centroExiste = await Centro.findByPk(id_centro)

        if (!centroExiste) {
            throw new AppError("El centro especificado no existe", 404)
        }

        const departamentoExistente = await Departamento.findOne({
            where: { nombre, id_centro },
        })

        if (departamentoExistente) {
            throw new AppError("Ya existe un departamento con este nombre en el centro seleccionado", 400)
        }

        const nuevoDepartamento = await Departamento.create({
            nombre,
            id_centro,
            descripcion,
            activo: activo !== undefined ? activo : true,
        })

        const departamentoConCentro = await Departamento.findByPk(nuevoDepartamento.id_departamento, {
            include: [
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                },
            ],
        })

        return res
            .status(201)
            .json(createResponse(true, "Departamento creado correctamente", { departamento: departamentoConCentro }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre, id_centro } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de departamento inválido", 400)
        }

        const departamento = await Departamento.findByPk(id)

        if (!departamento) {
            throw new AppError(`Departamento con ID ${id} no encontrado`, 404)
        }

        if (id_centro && id_centro !== departamento.id_centro) {
            const centroExiste = await Centro.findByPk(id_centro)

            if (!centroExiste) {
                throw new AppError("El centro especificado no existe", 404)
            }
        }

        if ((nombre && nombre !== departamento.nombre) || (id_centro && id_centro !== departamento.id_centro)) {
            const departamentoExistente = await Departamento.findOne({
                where: {
                    nombre: nombre || departamento.nombre,
                    id_centro: id_centro || departamento.id_centro,
                    id_departamento: { [Op.ne]: id },
                },
            })

            if (departamentoExistente) {
                throw new AppError("Ya existe otro departamento con este nombre en el centro seleccionado", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre", "id_centro", "descripcion", "activo"])

        await departamento.update(updateData)

        const departamentoActualizado = await Departamento.findByPk(id, {
            include: [
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                },
            ],
        })

        return res
            .status(200)
            .json(createResponse(true, "Departamento actualizado correctamente", { departamento: departamentoActualizado }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de departamento inválido", 400)
        }

        const departamento = await Departamento.findByPk(id)

        if (!departamento) {
            throw new AppError(`Departamento con ID ${id} no encontrado`, 404)
        }

        const empleadosAsociados = await Empleado.count({
            where: { id_departamento: id },
        })

        if (empleadosAsociados > 0) {
            throw new AppError("No se puede eliminar el departamento porque tiene empleados asociados", 400)
        }

        await departamento.destroy()

        return res.status(200).json(createResponse(true, "Departamento eliminado correctamente"))
    }),

    changeStatus: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { activo } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de departamento inválido", 400)
        }

        if (activo === undefined) {
            throw new AppError("El estado (activo) es requerido", 400)
        }

        const departamento = await Departamento.findByPk(id)

        if (!departamento) {
            throw new AppError(`Departamento con ID ${id} no encontrado`, 404)
        }

        await departamento.update({ activo })

        return res.status(200).json(
            createResponse(true, `Departamento ${activo ? "activado" : "desactivado"} correctamente`, {
                departamento: {
                    id_departamento: departamento.id_departamento,
                    nombre: departamento.nombre,
                    activo: departamento.activo,
                },
            }),
        )
    }),

}

module.exports = departamentoController

