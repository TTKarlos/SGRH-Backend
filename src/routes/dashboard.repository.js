const express = require("express")
const dashboardController = require("../controllers/dashboardController")
const auth = require("../middlewares/auth")

class DashboardRepository {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        // Ruta principal para obtener todas las estadísticas del dashboard
        this.router.get("/stats", auth, dashboardController.getStats)

        // Ruta para obtener solo el resumen general
        this.router.get("/summary", auth, dashboardController.getSummary)

        // Rutas específicas para cada tipo de estadística
        this.router.get("/empleados-por-empresa", auth, dashboardController.getEmpleadosPorEmpresa)
        this.router.get("/empleados-por-zona", auth, dashboardController.getEmpleadosPorZona)
        this.router.get("/empleados-por-departamento", auth, dashboardController.getEmpleadosPorDepartamento)

        // Ruta adicional para estado de empleados (activos/inactivos)
        this.router.get("/estado-empleados", auth, dashboardController.getEstadoEmpleados)
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new DashboardRepository()
