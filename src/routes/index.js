const express = require('express');
const authRepository = require('./auth.repository');
const userRepository = require('./user.repository');
const permisoRepository = require('./permiso.repository');
const rolRepository = require('./rol.repository');
const empleadosRepository = require('./empleado.repository');
const departamentoRepository = require('./departamento.repository');
const centroRepository = require('./centro.repository');
const zonaRepository = require('./zona.repository');

class ApiRouter {
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.use("/auth", authRepository.getRoutes());
        this.router.use("/users", userRepository.getRoutes());
        this.router.use("/permisos", permisoRepository.getRoutes());
        this.router.use("/rol", rolRepository.getRoutes());
        this.router.use("/empleados", empleadosRepository.getRoutes());
        this.router.use("/departamentos", departamentoRepository.getRoutes());
        this.router.use("/centros", centroRepository.getRoutes())
        this.router.use("/zonas", zonaRepository.getRoutes())

        this.router.get('/', (req, res) => {
            res.json({
                name: 'Sistema RRHH API',
                version: '1.0.0',
                status: 'Running...'
            });
        });

        this.router.use("*", (req, res) => {
            res.status(404).json({
                success: false,
                message: "Ruta no encontrada",
                statusCode: 404,
            });
        });
    }

    getRoutes() {
        return this.router;
    }
}
module.exports = new ApiRouter();
