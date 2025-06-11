const express = require("express")
const authRepository = require("./auth.repository")
const userRepository = require("./user.repository")
const permisoRepository = require("./permiso.repository")
const rolRepository = require("./rol.repository")
const empleadosRepository = require("./empleado.repository")
const departamentoRepository = require("./departamento.repository")
const centroRepository = require("./centro.repository")
const zonaRepository = require("./zona.repository")
const ausenciaRepository = require("./ausencia.repository")
const tipoAusenciaRepository = require("./tipoAusencia.repository")
const formacionEmpleadoRepository = require("./formacionEmpleado.repository")
const documentoRepository = require("./documento.repository")
const contratoRepository = require("./contrato.repository")
const tipoContratoRepository = require("./tipoContrato.repository")
const convenioRepository = require("./convenio.repository")
const categoriaConvenioRepository = require("./categoriaConvenio.repository")
const empresaRepository = require("./empresa.repository")
const informesPDFRepository = require("./informesPDF.repository")
const dashboardRepository = require("./dashboard.repository")



class ApiRouter {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        // ========================================
        // RUTAS DE AUTENTICACIÓN Y USUARIOS
        // ========================================
        this.router.use("/auth", authRepository.getRoutes())
        this.router.use("/users", userRepository.getRoutes())
        this.router.use("/permisos", permisoRepository.getRoutes())
        this.router.use("/rol", rolRepository.getRoutes())

        // ========================================
        // RUTAS DE GESTIÓN DE EMPLEADOS
        // ========================================
        this.router.use("/empleados", empleadosRepository.getRoutes())
        this.router.use("/departamentos", departamentoRepository.getRoutes())
        this.router.use("/centros", centroRepository.getRoutes())
        this.router.use("/zonas", zonaRepository.getRoutes())

        // ========================================
        // RUTAS DE GESTIÓN DE AUSENCIAS
        // ========================================
        this.router.use("/ausencias", ausenciaRepository.getRoutes())
        this.router.use("/tipos-ausencia", tipoAusenciaRepository.getRoutes())

        // ========================================
        // RUTAS DE FORMACIÓN Y DOCUMENTOS
        // ========================================
        this.router.use("/formaciones", formacionEmpleadoRepository.getRoutes())
        this.router.use("/documentos", documentoRepository.getRoutes())

        // ========================================
        // RUTAS DE CONTRATOS Y CONVENIOS
        // ========================================
        this.router.use("/contratos", contratoRepository.getRoutes())
        this.router.use("/tipos-contrato", tipoContratoRepository.getRoutes())
        this.router.use("/convenios", convenioRepository.getRoutes())
        this.router.use("/categorias-convenio", categoriaConvenioRepository.getRoutes())

        // ========================================
        // RUTAS DE EMPRESAS
        // ========================================
        this.router.use("/empresas", empresaRepository.getRoutes())

        // ========================================
        // RUTAS DE INFORMES PDF - SISTEMA COMPLETO
        // ========================================
        this.router.use("/informes", informesPDFRepository.getRoutes())

        this.router.use("/dashboard", dashboardRepository.getRoutes())


        // ========================================
        // RUTA PRINCIPAL Y MANEJO DE ERRORES
        // ========================================
        this.router.get("/", (req, res) => {
            res.json({
                name: "Sistema RRHH API",
                version: "2.0.0",
                status: "Running...",
                endpoints: {
                    auth: "/api/auth",
                    users: "/api/users",
                    empleados: "/api/empleados",
                    departamentos: "/api/departamentos",
                    centros: "/api/centros",
                    zonas: "/api/zonas",
                    ausencias: "/api/ausencias",
                    formaciones: "/api/formaciones",
                    documentos: "/api/documentos",
                    contratos: "/api/contratos",
                    convenios: "/api/convenios",
                    empresas: "/api/empresas",
                    informes: "/api/informes",
                },
                informes_sistema: {
                    disponibles: "/api/informes/disponibles",
                    test: "/api/informes/test",
                    opciones: {
                        departamentos: "/api/informes/opciones/departamentos",
                        centros: "/api/informes/opciones/centros",
                        zonas: "/api/informes/opciones/zonas",
                        empresas: "/api/informes/opciones/empresas",
                    },
                },
                ejemplos_informes: {
                    empleados_activos: "/api/informes/empleados/estado/activos",
                    departamento_especifico: "/api/informes/empleados/departamento/1",
                    centro_especifico: "/api/informes/empleados/centro/1",
                    zona_especifica: "/api/informes/empleados/zona/1",
                    empresa_especifica: "/api/informes/empleados/empresa/1",
                    cumpleanos_proximos: "/api/informes/especiales/cumpleanos/proximos?dias=30",
                    cumpleanos_fecha: "/api/informes/especiales/cumpleanos/fecha?fecha=2024-12-25",
                    cumpleanos_mes: "/api/informes/especiales/cumpleanos/mes/12",
                },
            })
        })

        // Manejo de rutas no encontradas
        this.router.use("*", (req, res) => {
            res.status(404).json({
                success: false,
                message: "Ruta no encontrada",
                statusCode: 404,
                ruta_solicitada: req.originalUrl,
                metodo: req.method,
                sugerencia: "Consulta /api/ para ver las rutas disponibles",
            })
        })
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new ApiRouter()
