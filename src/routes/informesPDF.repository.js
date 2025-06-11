const express = require("express")
const informesPDFController = require("../controllers/informesPDFController")
const auth = require("../middlewares/auth")

class InformesPDFRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.get("/empleados/todos", auth, informesPDFController.todosLosEmpleados)
        this.router.get("/empleados/estado/activos", auth, informesPDFController.empleadosActivos)
        this.router.get("/empleados/estado/inactivos", auth, informesPDFController.empleadosInactivos)
        this.router.get("/empleados/departamento/general", auth, informesPDFController.empleadosPorDepartamentoGeneral)
        this.router.get("/empleados/departamento/:id", auth, informesPDFController.empleadosPorDepartamentoEspecifico)
        this.router.get("/empleados/centro/general", auth, informesPDFController.empleadosPorCentroGeneral)
        this.router.get("/empleados/centro/:id", auth, informesPDFController.empleadosPorCentroEspecifico)
        this.router.get("/empleados/zona/general", auth, informesPDFController.empleadosPorZonaGeneral)
        this.router.get("/empleados/zona/:id", auth, informesPDFController.empleadosPorZonaEspecifica)
        this.router.get("/empleados/empresa/general", auth, informesPDFController.empleadosPorEmpresaGeneral)
        this.router.get("/empleados/empresa/:id", auth, informesPDFController.empleadosPorEmpresaEspecifica)
        this.router.get("/especiales/cumpleanos/rango", auth, informesPDFController.cumpleanosPorRango)
        this.router.get("/especiales/contactos", auth, informesPDFController.informeContactos)
        this.router.get("/dashboard/ejecutivo", auth, informesPDFController.dashboardEjecutivo)
        this.router.get("/opciones/departamentos", auth, this.getOpcionesDepartamentos.bind(this))
        this.router.get("/opciones/centros", auth, this.getOpcionesCentros.bind(this))
        this.router.get("/opciones/zonas", auth, this.getOpcionesZonas.bind(this))
        this.router.get("/opciones/empresas", auth, this.getOpcionesEmpresas.bind(this))
        this.router.get("/disponibles", auth, this.getInformesDisponibles.bind(this))
        this.router.get("/test", auth, this.testRoute.bind(this))
    }

    async getOpcionesDepartamentos(req, res) {
        try {
            const Departamento = require("../models/Departamento")
            const Empleado = require("../models/Empleado")

            const departamentos = await Departamento.findAll({
                attributes: ["id_departamento", "nombre", "descripcion"],
                include: [{ model: Empleado, attributes: ["id_empleado"] }],
                order: [["nombre", "ASC"]],
            })

            const opciones = departamentos.map((dep) => ({
                id: dep.id_departamento,
                nombre: dep.nombre,
                descripcion: dep.descripcion,
                total_empleados: dep.Empleados ? dep.Empleados.length : 0,
                ruta_informe: `/empleados/departamento/${dep.id_departamento}`,
            }))

            res.json({
                success: true,
                data: {
                    departamentos: opciones,
                    total: opciones.length,
                    ruta_general: "/empleados/departamento/general",
                },
            })
        } catch (error) {
            console.error("Error obteniendo departamentos:", error)
            res.status(500).json({
                success: false,
                message: "Error al obtener departamentos",
                error: error.message,
            })
        }
    }

    async getOpcionesCentros(req, res) {
        try {
            const Centro = require("../models/Centro")
            const Empleado = require("../models/Empleado")
            const Zona = require("../models/Zona")

            const centros = await Centro.findAll({
                attributes: ["id_centro", "nombre", "direccion"],
                include: [
                    { model: Empleado, attributes: ["id_empleado"] },
                    { model: Zona, attributes: ["nombre"] },
                ],
                order: [["nombre", "ASC"]],
            })

            const opciones = centros.map((centro) => ({
                id: centro.id_centro,
                nombre: centro.nombre,
                direccion: centro.direccion,
                zona: centro.Zona ? centro.Zona.nombre : "Sin zona",
                total_empleados: centro.Empleados ? centro.Empleados.length : 0,
                ruta_informe: `/empleados/centro/${centro.id_centro}`,
            }))

            res.json({
                success: true,
                data: {
                    centros: opciones,
                    total: opciones.length,
                    ruta_general: "/empleados/centro/general",
                },
            })
        } catch (error) {
            console.error("Error obteniendo centros:", error)
            res.status(500).json({
                success: false,
                message: "Error al obtener centros",
                error: error.message,
            })
        }
    }

    async getOpcionesZonas(req, res) {
        try {
            const Zona = require("../models/Zona")
            const Centro = require("../models/Centro")
            const Empleado = require("../models/Empleado")

            const zonas = await Zona.findAll({
                attributes: ["id_zona", "nombre", "descripcion"],
                include: [
                    {
                        model: Centro,
                        attributes: ["id_centro"],
                        include: [{ model: Empleado, attributes: ["id_empleado"] }],
                    },
                ],
                order: [["nombre", "ASC"]],
            })

            const opciones = zonas.map((zona) => {
                const totalEmpleados = zona.Centros
                    ? zona.Centros.reduce((total, centro) => total + (centro.Empleados ? centro.Empleados.length : 0), 0)
                    : 0

                return {
                    id: zona.id_zona,
                    nombre: zona.nombre,
                    descripcion: zona.descripcion,
                    total_centros: zona.Centros ? zona.Centros.length : 0,
                    total_empleados: totalEmpleados,
                    ruta_informe: `/empleados/zona/${zona.id_zona}`,
                }
            })

            res.json({
                success: true,
                data: {
                    zonas: opciones,
                    total: opciones.length,
                    ruta_general: "/empleados/zona/general",
                },
            })
        } catch (error) {
            console.error("Error obteniendo zonas:", error)
            res.status(500).json({
                success: false,
                message: "Error al obtener zonas",
                error: error.message,
            })
        }
    }

    async getOpcionesEmpresas(req, res) {
        try {
            const Empresa = require("../models/Empresa")
            const Contrato = require("../models/Contrato")
            const Empleado = require("../models/Empleado")

            const empresas = await Empresa.findAll({
                attributes: ["id_empresa", "nombre", "cif", "direccion"],
                include: [
                    {
                        model: Contrato,
                        attributes: ["id_contrato"],
                        include: [{ model: Empleado, attributes: ["id_empleado"] }],
                    },
                ],
                order: [["nombre", "ASC"]],
            })

            const opciones = empresas.map((empresa) => {
                const empleadosUnicos = empresa.Contratos
                    ? [...new Set(empresa.Contratos.map((c) => c.Empleado?.id_empleado).filter(Boolean))].length
                    : 0

                return {
                    id: empresa.id_empresa,
                    nombre: empresa.nombre,
                    cif: empresa.cif,
                    direccion: empresa.direccion,
                    total_contratos: empresa.Contratos ? empresa.Contratos.length : 0,
                    total_empleados: empleadosUnicos,
                    ruta_informe: `/empleados/empresa/${empresa.id_empresa}`,
                }
            })

            res.json({
                success: true,
                data: {
                    empresas: opciones,
                    total: opciones.length,
                    ruta_general: "/empleados/empresa/general",
                },
            })
        } catch (error) {
            console.error("Error obteniendo empresas:", error)
            res.status(500).json({
                success: false,
                message: "Error al obtener empresas",
                error: error.message,
            })
        }
    }

    testRoute(req, res) {
        res.json({
            success: true,
            message: "Sistema de informes optimizado funcionando correctamente",
            timestamp: new Date().toISOString(),
            user: req.user ? req.user.id : "No identificado",
            rutas_principales: {
                empleados_activos: "/empleados/estado/activos",
                empleados_inactivos: "/empleados/estado/inactivos",
                departamento_general: "/empleados/departamento/general",
                departamento_especifico: "/empleados/departamento/:id",
                centro_general: "/empleados/centro/general",
                centro_especifico: "/empleados/centro/:id",
                zona_general: "/empleados/zona/general",
                zona_especifica: "/empleados/zona/:id",
                empresa_general: "/empleados/empresa/general",
                empresa_especifica: "/empleados/empresa/:id",
                cumpleanos_rango: "/especiales/cumpleanos/rango?fechaInicio=2024-01-01&fechaFin=2024-12-31",
                contactos: "/especiales/contactos",
                dashboard: "/dashboard/ejecutivo",
            },
            rutas_opciones: {
                departamentos: "/opciones/departamentos",
                centros: "/opciones/centros",
                zonas: "/opciones/zonas",
                empresas: "/opciones/empresas",
            },
            formato_cumpleanos: {
                descripcion: "Para cumpleaños usar fechaInicio y fechaFin en formato YYYY-MM-DD",
                ejemplo: "/especiales/cumpleanos/rango?fechaInicio=2024-06-01&fechaFin=2024-06-30",
                vue_js_friendly: "Perfecto para usar con dos calendarios en Vue.js",
            },
        })
    }

    getInformesDisponibles(req, res) {
        try {
            const userRole = req.user?.role || "user"

            const informesDisponibles = [
                {
                    categoria: "Empleados por Estado",
                    informes: [
                        {
                            id: "empleados-activos",
                            nombre: "Empleados Activos",
                            ruta: "/empleados/estado/activos",
                            descripcion: "Lista completa de empleados activos",
                            parametros: [],
                            ejemplo: "/empleados/estado/activos",
                        },
                        {
                            id: "empleados-inactivos",
                            nombre: "Empleados Inactivos",
                            ruta: "/empleados/estado/inactivos",
                            descripcion: "Lista completa de empleados inactivos",
                            parametros: [],
                            ejemplo: "/empleados/estado/inactivos",
                        },
                    ],
                },
                {
                    categoria: "Empleados por Departamento",
                    informes: [
                        {
                            id: "departamento-general",
                            nombre: "Todos los Departamentos",
                            ruta: "/empleados/departamento/general",
                            descripcion: "Empleados agrupados por todos los departamentos",
                            parametros: [],
                            ejemplo: "/empleados/departamento/general",
                        },
                        {
                            id: "departamento-especifico",
                            nombre: "Departamento Específico",
                            ruta: "/empleados/departamento/:id",
                            descripcion: "Empleados de un departamento específico",
                            parametros: ["id (ID del departamento)"],
                            ejemplo: "/empleados/departamento/1",
                            opciones_url: "/opciones/departamentos",
                        },
                    ],
                },
                {
                    categoria: "Empleados por Centro",
                    informes: [
                        {
                            id: "centro-general",
                            nombre: "Todos los Centros",
                            ruta: "/empleados/centro/general",
                            descripcion: "Empleados agrupados por todos los centros",
                            parametros: [],
                            ejemplo: "/empleados/centro/general",
                        },
                        {
                            id: "centro-especifico",
                            nombre: "Centro Específico",
                            ruta: "/empleados/centro/:id",
                            descripcion: "Empleados de un centro específico",
                            parametros: ["id (ID del centro)"],
                            ejemplo: "/empleados/centro/1",
                            opciones_url: "/opciones/centros",
                        },
                    ],
                },
                {
                    categoria: "Empleados por Zona",
                    informes: [
                        {
                            id: "zona-general",
                            nombre: "Todas las Zonas",
                            ruta: "/empleados/zona/general",
                            descripcion: "Empleados agrupados por todas las zonas",
                            parametros: [],
                            ejemplo: "/empleados/zona/general",
                        },
                        {
                            id: "zona-especifica",
                            nombre: "Zona Específica",
                            ruta: "/empleados/zona/:id",
                            descripcion: "Empleados de una zona específica",
                            parametros: ["id (ID de la zona)"],
                            ejemplo: "/empleados/zona/1",
                            opciones_url: "/opciones/zonas",
                        },
                    ],
                },
                {
                    categoria: "Empleados por Empresa",
                    informes: [
                        {
                            id: "empresa-general",
                            nombre: "Todas las Empresas",
                            ruta: "/empleados/empresa/general",
                            descripcion: "Empleados agrupados por todas las empresas",
                            parametros: [],
                            ejemplo: "/empleados/empresa/general",
                        },
                        {
                            id: "empresa-especifica",
                            nombre: "Empresa Específica",
                            ruta: "/empleados/empresa/:id",
                            descripcion: "Empleados de una empresa específica",
                            parametros: ["id (ID de la empresa)"],
                            ejemplo: "/empleados/empresa/1",
                            opciones_url: "/opciones/empresas",
                        },
                    ],
                },
                {
                    categoria: "Informes Especiales",
                    informes: [
                        {
                            id: "cumpleanos-rango",
                            nombre: "Cumpleaños por Rango de Fechas",
                            ruta: "/especiales/cumpleanos/rango",
                            descripcion: "Empleados que cumplen años en un rango de fechas específico",
                            parametros: ["fechaInicio (YYYY-MM-DD)", "fechaFin (YYYY-MM-DD)"],
                            ejemplo: "/especiales/cumpleanos/rango?fechaInicio=2024-01-01&fechaFin=2024-12-31",
                            vue_js: "Ideal para usar con dos componentes de calendario",
                            validaciones: {
                                fechaInicio: "Requerida, formato YYYY-MM-DD",
                                fechaFin: "Requerida, formato YYYY-MM-DD, debe ser >= fechaInicio",
                            },
                        },
                        {
                            id: "directorio-contactos",
                            nombre: "Directorio de Contactos",
                            ruta: "/especiales/contactos",
                            descripcion: "Información completa de contacto de empleados",
                            parametros: [],
                            ejemplo: "/especiales/contactos",
                            mejoras: "Muestra nombres completos, emails y teléfonos sin truncar",
                        },
                    ],
                },
            ]

            if (userRole === "admin") {
                informesDisponibles.push({
                    categoria: "Administración",
                    informes: [
                        {
                            id: "empleados-todos",
                            nombre: "Todos los Empleados",
                            ruta: "/empleados/todos",
                            descripcion: "Lista completa de todos los empleados",
                            parametros: [],
                            ejemplo: "/empleados/todos",
                        },
                        {
                            id: "dashboard-ejecutivo",
                            nombre: "Dashboard Ejecutivo",
                            ruta: "/dashboard/ejecutivo",
                            descripcion: "Resumen ejecutivo del sistema",
                            parametros: [],
                            ejemplo: "/dashboard/ejecutivo",
                        },
                    ],
                })
            }

            res.json({
                success: true,
                data: {
                    role: userRole,
                    informes: informesDisponibles,
                    total: informesDisponibles.reduce((total, categoria) => total + categoria.informes.length, 0),
                    opciones_disponibles: {
                        departamentos: "/opciones/departamentos",
                        centros: "/opciones/centros",
                        zonas: "/opciones/zonas",
                        empresas: "/opciones/empresas",
                    },
                    instrucciones: {
                        uso: "Usa las rutas de opciones para obtener IDs disponibles",
                        formato: "Todos los informes se generan en formato PDF",
                        autenticacion: "Requiere token de autenticación válido",
                        filtros: "Puedes filtrar por departamento, centro, zona y empresa específicos",
                        cumpleanos: "Usa rango de fechas para informes de cumpleaños",
                        optimizaciones: "PDFs optimizados con texto que se ajusta correctamente",
                    },
                },
            })
        } catch (error) {
            console.error("Error obteniendo informes disponibles:", error)
            res.status(500).json({
                success: false,
                message: "Error al obtener la lista de informes disponibles",
                error: error.message,
            })
        }
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new InformesPDFRepository()
