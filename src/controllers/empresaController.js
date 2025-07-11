const { Empresa, Contrato, Empleado, sequelize, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject } = require("../utils/queryBuilder")

const empresaController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const order = req.query.order || "ASC"
        const orderBy = req.query.orderBy || "nombre"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "cif", "email"])
        }

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
        }

        const { data: empresas, pagination } = await paginate(Empresa, req, options)

        return res.status(200).json(
            createResponse(true, "Empresas obtenidas correctamente", {
                empresas,
                pagination,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de empresa inválido", 400)
        }

        const empresa = await Empresa.findByPk(id)

        if (!empresa) {
            throw new AppError(`Empresa con ID ${id} no encontrada`, 404)
        }

        const contratosCount = await Contrato.count({
            where: { id_empresa: id },
        })

        const empleadosCount = await Empleado.count({
            where: { id_empresa: id },
        })

        return res.status(200).json(
            createResponse(true, "Empresa obtenida correctamente", {
                empresa,
                estadisticas: {
                    contratos: contratosCount,
                    empleados: empleadosCount,
                },
            }),
        )
    }),

    create: asyncHandler(async (req, res) => {
        const { nombre, cif, direccion, telefono, email } = req.body

        validateFields(["nombre", "cif"], req.body)

        const empresaExistente = await Empresa.findOne({
            where: { cif },
        })

        if (empresaExistente) {
            throw new AppError("Ya existe una empresa con este CIF", 400)
        }

        const nuevaEmpresa = await Empresa.create({
            nombre,
            cif,
            direccion,
            telefono,
            email,
        })

        return res.status(201).json(createResponse(true, "Empresa creada correctamente", { empresa: nuevaEmpresa }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { nombre, cif, direccion, telefono, email } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de empresa inválido", 400)
        }

        const empresa = await Empresa.findByPk(id)

        if (!empresa) {
            throw new AppError(`Empresa con ID ${id} no encontrada`, 404)
        }

        if (cif && cif !== empresa.cif) {
            const empresaExistente = await Empresa.findOne({
                where: {
                    cif,
                    id_empresa: { [Op.ne]: id },
                },
            })

            if (empresaExistente) {
                throw new AppError("Ya existe otra empresa con este CIF", 400)
            }
        }

        const updateData = buildUpdateObject(req.body, ["nombre", "cif", "direccion", "telefono", "email"])

        await empresa.update(updateData)

        return res.status(200).json(createResponse(true, "Empresa actualizada correctamente", { empresa }))
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de empresa inválido", 400)
        }

        const empresa = await Empresa.findByPk(id)

        if (!empresa) {
            throw new AppError(`Empresa con ID ${id} no encontrada`, 404)
        }

        const contratosAsociados = await Contrato.count({
            where: { id_empresa: id },
        })

        const empleadosAsociados = await Empleado.count({
            where: { id_empresa: id },
        })

        if (contratosAsociados > 0 || empleadosAsociados > 0) {
            throw new AppError("No se puede eliminar la empresa porque tiene contratos o empleados asociados", 400)
        }

        await empresa.destroy()

        return res.status(200).json(createResponse(true, "Empresa eliminada correctamente"))
    }),

    count: asyncHandler(async (req, res) => {
        const totalEmpresas = await Empresa.count()

        return res.status(200).json(
            createResponse(true, "Total de empresas obtenido correctamente", {
                total: totalEmpresas,
            }),
        )
    }),

    getEmpleadosDistribution: asyncHandler(async (req, res) => {
        const empleadosPorEmpresa = await Empleado.findAll({
            attributes: [
                [sequelize.col("empresa.id_empresa"), "id_empresa"],
                [sequelize.col("empresa.nombre"), "nombre_empresa"],
                [sequelize.fn("COUNT", sequelize.col("Empleado.id_empleado")), "total_empleados"],
            ],
            include: [
                {
                    model: Empresa,
                    as: "empresa",
                    attributes: [],
                },
            ],
            where: {
                activo: true,
            },
            group: ["empresa.id_empresa", "empresa.nombre"],
            order: [[sequelize.literal("total_empleados"), "DESC"]],
        })

        return res.status(200).json(
            createResponse(true, "Distribución de empleados por empresa obtenida correctamente", {
                data: empleadosPorEmpresa,
            }),
        )
    }),
}

module.exports = empresaController
