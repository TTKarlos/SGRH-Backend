const { Empleado, Empresa, Departamento, Zona, Centro, Contrato, sequelize } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, asyncHandler } = require("../utils/responseHelpers")

const dashboardController = {
    /**
     * Obtener estadísticas del dashboard
     */
    getStats: asyncHandler(async (req, res) => {
        const empleadosPorEmpresa = await sequelize.query(
            `
            SELECT 
                e.id_empresa,
                e.nombre as empresa_nombre,
                COUNT(DISTINCT emp.id_empleado) as total_empleados
            FROM empresas e
            LEFT JOIN contratos c ON e.id_empresa = c.id_empresa
            LEFT JOIN empleados emp ON c.id_empleado = emp.id_empleado AND emp.activo = 1
            GROUP BY e.id_empresa, e.nombre
            ORDER BY total_empleados DESC
        `,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        )

        const empleadosPorZona = await sequelize.query(
            `
            SELECT 
                z.id_zona,
                z.nombre as zona_nombre,
                COUNT(DISTINCT e.id_empleado) as total_empleados
            FROM zonas z
            LEFT JOIN centros c ON z.id_zona = c.id_zona
            LEFT JOIN empleados e ON c.id_centro = e.id_centro AND e.activo = 1
            GROUP BY z.id_zona, z.nombre
            ORDER BY total_empleados DESC
        `,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        )

        const empleadosPorDepartamento = await sequelize.query(
            `
            SELECT 
                d.id_departamento,
                d.nombre as departamento_nombre,
                COUNT(DISTINCT e.id_empleado) as total_empleados
            FROM departamentos d
            LEFT JOIN empleados e ON d.id_departamento = e.id_departamento AND e.activo = 1
            GROUP BY d.id_departamento, d.nombre
            ORDER BY total_empleados DESC
        `,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        )

        const totalEmpleados = await Empleado.count({
            where: { activo: true },
        })

        const totalEmpresas = await Empresa.count()
        const totalZonas = await Zona.count()
        const totalDepartamentos = await Departamento.count()

        const dashboardData = {
            resumen: {
                total_empleados: totalEmpleados,
                total_empresas: totalEmpresas,
                total_zonas: totalZonas,
                total_departamentos: totalDepartamentos,
            },
            empleados_por_empresa: empleadosPorEmpresa.map((item) => ({
                id: item.id_empresa,
                nombre: item.empresa_nombre,
                total_empleados: Number.parseInt(item.total_empleados),
            })),
            empleados_por_zona: empleadosPorZona.map((item) => ({
                id: item.id_zona,
                nombre: item.zona_nombre,
                total_empleados: Number.parseInt(item.total_empleados),
            })),
            empleados_por_departamento: empleadosPorDepartamento.map((item) => ({
                id: item.id_departamento,
                nombre: item.departamento_nombre,
                total_empleados: Number.parseInt(item.total_empleados),
            })),
        }

        return res
            .status(200)
            .json(createResponse(true, "Estadísticas del dashboard obtenidas correctamente", dashboardData))
    }),

    /**
     * Obtener estadísticas resumidas
     */
    getSummary: asyncHandler(async (req, res) => {
        const totalEmpleados = await Empleado.count({
            where: { activo: true },
        })

        const totalEmpresas = await Empresa.count()
        const totalZonas = await Zona.count()
        const totalDepartamentos = await Departamento.count()

        const resumen = {
            total_empleados: totalEmpleados,
            total_empresas: totalEmpresas,
            total_zonas: totalZonas,
            total_departamentos: totalDepartamentos,
        }

        return res.status(200).json(createResponse(true, "Resumen de estadísticas obtenido correctamente", resumen))
    }),

    /**
     * Obtener empleados por empresa específica
     */
    getEmpleadosPorEmpresa: asyncHandler(async (req, res) => {
        const empleadosPorEmpresa = await sequelize.query(
            `
            SELECT 
                e.id_empresa,
                e.nombre as empresa_nombre,
                e.cif,
                COUNT(DISTINCT emp.id_empleado) as total_empleados
            FROM empresas e
            LEFT JOIN contratos c ON e.id_empresa = c.id_empresa
            LEFT JOIN empleados emp ON c.id_empleado = emp.id_empleado AND emp.activo = 1
            GROUP BY e.id_empresa, e.nombre, e.cif
            ORDER BY total_empleados DESC
        `,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        )

        const data = empleadosPorEmpresa.map((item) => ({
            id: item.id_empresa,
            nombre: item.empresa_nombre,
            cif: item.cif,
            total_empleados: Number.parseInt(item.total_empleados),
        }))

        return res
            .status(200)
            .json(createResponse(true, "Empleados por empresa obtenidos correctamente", { empresas: data }))
    }),

    /**
     * Obtener empleados por zona específica
     */
    getEmpleadosPorZona: asyncHandler(async (req, res) => {
        const empleadosPorZona = await sequelize.query(
            `
            SELECT 
                z.id_zona,
                z.nombre as zona_nombre,
                z.descripcion,
                COUNT(DISTINCT e.id_empleado) as total_empleados
            FROM zonas z
            LEFT JOIN centros c ON z.id_zona = c.id_zona
            LEFT JOIN empleados e ON c.id_centro = e.id_centro AND e.activo = 1
            GROUP BY z.id_zona, z.nombre, z.descripcion
            ORDER BY total_empleados DESC
        `,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        )

        const data = empleadosPorZona.map((item) => ({
            id: item.id_zona,
            nombre: item.zona_nombre,
            descripcion: item.descripcion,
            total_empleados: Number.parseInt(item.total_empleados),
        }))

        return res.status(200).json(createResponse(true, "Empleados por zona obtenidos correctamente", { zonas: data }))
    }),

    /**
     * Obtener empleados por departamento específico
     */
    getEmpleadosPorDepartamento: asyncHandler(async (req, res) => {
        const empleadosPorDepartamento = await sequelize.query(
            `
            SELECT 
                d.id_departamento,
                d.nombre as departamento_nombre,
                d.descripcion,
                c.nombre as centro_nombre,
                z.nombre as zona_nombre,
                COUNT(DISTINCT e.id_empleado) as total_empleados
            FROM departamentos d
            LEFT JOIN centros c ON d.id_centro = c.id_centro
            LEFT JOIN zonas z ON c.id_zona = z.id_zona
            LEFT JOIN empleados e ON d.id_departamento = e.id_departamento AND e.activo = 1
            GROUP BY d.id_departamento, d.nombre, d.descripcion, c.nombre, z.nombre
            ORDER BY total_empleados DESC
        `,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        )

        const data = empleadosPorDepartamento.map((item) => ({
            id: item.id_departamento,
            nombre: item.departamento_nombre,
            descripcion: item.descripcion,
            centro: item.centro_nombre,
            zona: item.zona_nombre,
            total_empleados: Number.parseInt(item.total_empleados),
        }))

        return res
            .status(200)
            .json(createResponse(true, "Empleados por departamento obtenidos correctamente", { departamentos: data }))
    }),

    /**
     * Obtener estadísticas de empleados activos vs inactivos
     */
    getEstadoEmpleados: asyncHandler(async (req, res) => {
        const empleadosActivos = await Empleado.count({
            where: { activo: true },
        })

        const empleadosInactivos = await Empleado.count({
            where: { activo: false },
        })

        const totalEmpleados = empleadosActivos + empleadosInactivos

        const estadoData = {
            empleados_activos: empleadosActivos,
            empleados_inactivos: empleadosInactivos,
            total_empleados: totalEmpleados,
            porcentaje_activos: totalEmpleados > 0 ? Math.round((empleadosActivos / totalEmpleados) * 100) : 0,
            porcentaje_inactivos: totalEmpleados > 0 ? Math.round((empleadosInactivos / totalEmpleados) * 100) : 0,
        }

        return res.status(200).json(createResponse(true, "Estado de empleados obtenido correctamente", estadoData))
    }),
}

module.exports = dashboardController
