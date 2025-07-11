const { Empleado, Departamento, Centro, Documento, Contrato, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { paginate } = require("../utils/pagination")
const { buildSearchClause, buildUpdateObject, buildFilterClause } = require("../utils/queryBuilder")

const empleadoController = {
    getAll: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const activo = req.query.activo !== undefined ? req.query.activo === "true" : null
        const id_departamento = req.query.id_departamento || null
        const id_centro = req.query.id_centro || null
        const order = req.query.order || "ASC"
        const orderBy = req.query.orderBy || "apellidos"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "apellidos", "dni_nie", "email"])
        }

        const filtros = buildFilterClause({
            activo,
            id_departamento,
            id_centro,
        })

        whereClause = { ...whereClause, ...filtros }

        const options = {
            where: whereClause,
            order: [[orderBy, order]],
            include: [
                {
                    model: Departamento,
                    attributes: ["id_departamento", "nombre"],
                    required: false,
                },
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                    required: false,
                },
            ],
        }

        const { data: empleados, pagination } = await paginate(Empleado, req, options)

        return res.status(200).json(
            createResponse(true, "Empleados obtenidos correctamente", {
                empleados,
                pagination,
            }),
        )
    }),

    getAllWithoutPagination: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const activo = req.query.activo !== undefined ? req.query.activo === "true" : null
        const id_departamento = req.query.id_departamento || null
        const id_centro = req.query.id_centro || null
        const order = req.query.order || "ASC"
        const orderBy = req.query.orderBy || "apellidos"

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "apellidos", "dni_nie", "email"])
        }

        const filtros = buildFilterClause({
            activo,
            id_departamento,
            id_centro,
        })

        whereClause = { ...whereClause, ...filtros }

        const empleados = await Empleado.findAll({
            where: whereClause,
            order: [[orderBy, order]],
            include: [
                {
                    model: Departamento,
                    attributes: ["id_departamento", "nombre"],
                    required: false,
                },
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                    required: false,
                },
            ],
        })

        return res.status(200).json(
            createResponse(true, "Empleados obtenidos correctamente", {
                empleados,
                total: empleados.length,
            }),
        )
    }),

    getCount: asyncHandler(async (req, res) => {
        const search = req.query.search || ""
        const activo = req.query.activo !== undefined ? req.query.activo === "true" : null
        const id_departamento = req.query.id_departamento || null
        const id_centro = req.query.id_centro || null

        let whereClause = {}

        if (search) {
            whereClause = buildSearchClause(search, ["nombre", "apellidos", "dni_nie", "email"])
        }

        const filtros = buildFilterClause({
            activo,
            id_departamento,
            id_centro,
        })

        whereClause = { ...whereClause, ...filtros }

        const count = await Empleado.count({ where: whereClause })

        return res.status(200).json(
            createResponse(true, "Conteo de empleados obtenido correctamente", {
                total: count,
            }),
        )
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de empleado inválido", 400)
        }

        const empleado = await Empleado.findByPk(id, {
            include: [
                {
                    model: Departamento,
                    attributes: ["id_departamento", "nombre"],
                },
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                },
            ],
        })

        if (!empleado) {
            throw new AppError(`Empleado con ID ${id} no encontrado`, 404)
        }

        return res.status(200).json(createResponse(true, "Empleado obtenido correctamente", { empleado }))
    }),

    create: asyncHandler(async (req, res) => {
        const {
            nombre,
            apellidos,
            dni_nie,
            fecha_nacimiento,
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

        validateFields(["nombre", "apellidos", "dni_nie"], req.body)

        const empleadoExistente = await Empleado.findOne({
            where: { dni_nie },
        })

        if (empleadoExistente) {
            throw new AppError("Ya existe un empleado con este DNI/NIE", 400)
        }

        if (id_departamento) {
            const departamentoExiste = await Departamento.findByPk(id_departamento)
            if (!departamentoExiste) {
                throw new AppError("El departamento especificado no existe", 404)
            }
        }

        if (id_centro) {
            const centroExiste = await Centro.findByPk(id_centro)
            if (!centroExiste) {
                throw new AppError("El centro especificado no existe", 404)
            }
        }

        const nuevoEmpleado = await Empleado.create({
            nombre,
            apellidos,
            dni_nie,
            fecha_nacimiento,
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

        const empleadoConRelaciones = await Empleado.findByPk(nuevoEmpleado.id_empleado, {
            include: [
                {
                    model: Departamento,
                    attributes: ["id_departamento", "nombre"],
                },
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                },
            ],
        })

        return res
            .status(201)
            .json(createResponse(true, "Empleado creado correctamente", { empleado: empleadoConRelaciones }, 201))
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { dni_nie } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de empleado inválido", 400)
        }

        const empleado = await Empleado.findByPk(id)

        if (!empleado) {
            throw new AppError(`Empleado con ID ${id} no encontrado`, 404)
        }

        if (dni_nie && dni_nie !== empleado.dni_nie) {
            const empleadoExistente = await Empleado.findOne({
                where: {
                    dni_nie,
                    id_empleado: { [Op.ne]: id },
                },
            })

            if (empleadoExistente) {
                throw new AppError("Ya existe otro empleado con este DNI/NIE", 400)
            }
        }

        if (req.body.id_departamento) {
            const departamentoExiste = await Departamento.findByPk(req.body.id_departamento)
            if (!departamentoExiste) {
                throw new AppError("El departamento especificado no existe", 404)
            }
        }

        if (req.body.id_centro) {
            const centroExiste = await Centro.findByPk(req.body.id_centro)
            if (!centroExiste) {
                throw new AppError("El centro especificado no existe", 404)
            }
        }

        const updateData = buildUpdateObject(req.body, [
            "nombre",
            "apellidos",
            "dni_nie",
            "fecha_nacimiento",
            "direccion",
            "telefono",
            "email",
            "estado_civil",
            "id_departamento",
            "id_centro",
            "puesto_actual",
            "fecha_incorporacion",
            "activo",
        ])

        await empleado.update(updateData)

        const empleadoActualizado = await Empleado.findByPk(id, {
            include: [
                {
                    model: Departamento,
                    attributes: ["id_departamento", "nombre"],
                },
                {
                    model: Centro,
                    attributes: ["id_centro", "nombre"],
                },
            ],
        })

        return res
            .status(200)
            .json(createResponse(true, "Empleado actualizado correctamente", { empleado: empleadoActualizado }))
    }),

    getDeleteInfo: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de empleado inválido", 400)
        }

        const empleado = await Empleado.findByPk(id, {
            include: [
                {
                    model: Documento,
                    attributes: ['id_documento', 'nombre']
                },
                {
                    model: Contrato,
                    attributes: ['id_contrato', 'fecha_inicio', 'fecha_fin'],
                    include: [
                        {
                            model: require('../models').TipoContrato,
                            attributes: ['nombre']
                        }
                    ]
                }
            ]
        })

        if (!empleado) {
            throw new AppError(`Empleado con ID ${id} no encontrado`, 404)
        }

        const totalDocumentos = empleado.Documentos ? empleado.Documentos.length : 0;
        const totalContratos = empleado.Contratos ? empleado.Contratos.length : 0;

        return res.status(200).json(
            createResponse(true, "Información de eliminación obtenida", {
                empleado: {
                    id_empleado: empleado.id_empleado,
                    nombre: empleado.nombre,
                    apellidos: empleado.apellidos,
                    dni_nie: empleado.dni_nie
                },
                registros_relacionados: {
                    documentos: totalDocumentos,
                    contratos: totalContratos,
                    lista_documentos: empleado.Documentos?.map(doc => ({
                        id: doc.id_documento,
                        nombre: doc.nombre
                    })) || [],
                    lista_contratos: empleado.Contratos?.map(cont => ({
                        id: cont.id_contrato,
                        tipo: cont.TipoContrato?.nombre || 'N/A',
                        fecha_inicio: cont.fecha_inicio,
                        fecha_fin: cont.fecha_fin
                    })) || []
                },
                advertencia: "⚠️ Al eliminar este empleado se eliminarán automáticamente todos sus documentos y contratos asociados, incluyendo los archivos físicos."
            })
        )
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de empleado inválido", 400)
        }

        const empleado = await Empleado.findByPk(id, {
            include: [
                {
                    model: Documento,
                    attributes: ['id_documento', 'nombre', 'ruta_archivo']
                },
                {
                    model: Contrato,
                    attributes: ['id_contrato', 'ruta_archivo']
                }
            ]
        })

        if (!empleado) {
            throw new AppError(`Empleado con ID ${id} no encontrado`, 404)
        }

        const totalDocumentos = empleado.Documentos ? empleado.Documentos.length : 0;
        const totalContratos = empleado.Contratos ? empleado.Contratos.length : 0;

        await empleado.destroy()

        return res.status(200).json(
            createResponse(true, "Empleado eliminado correctamente", {
                empleado_eliminado: {
                    id_empleado: empleado.id_empleado,
                    nombre: empleado.nombre,
                    apellidos: empleado.apellidos,
                    dni_nie: empleado.dni_nie
                },
                registros_eliminados: {
                    documentos: totalDocumentos,
                    contratos: totalContratos
                },
                mensaje: "Se han eliminado automáticamente todos los registros relacionados y archivos físicos."
            })
        )
    }),

    changeStatus: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { activo } = req.body

        if (!id || isNaN(Number.parseInt(id, 10))) {
            throw new AppError("ID de empleado inválido", 400)
        }

        if (activo === undefined) {
            throw new AppError("El estado (activo) es requerido", 400)
        }

        const empleado = await Empleado.findByPk(id)

        if (!empleado) {
            throw new AppError(`Empleado con ID ${id} no encontrado`, 404)
        }

        await empleado.update({ activo })

        return res.status(200).json(
            createResponse(true, `Empleado ${activo ? "activado" : "desactivado"} correctamente`, {
                empleado: {
                    id_empleado: empleado.id_empleado,
                    nombre: empleado.nombre,
                    apellidos: empleado.apellidos,
                    activo: empleado.activo,
                },
            }),
        )
    }),
}

module.exports = empleadoController