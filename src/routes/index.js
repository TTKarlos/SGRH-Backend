const express = require('express');
const authRepository = require('./auth.repository');
const userRepository = require('./user.repository');


class ApiRouter {
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.use("/auth", authRepository.getRoutes());
        this.router.use("/users", userRepository.getRoutes());

        this.router.get('/', (req, res) => {
            res.json({
                name: 'Sistema RRHH API',
                version: '1.0.0',
                status: 'Running...'
            });
        });
    }

    getRoutes() {
        return this.router;
    }
}

// Create and export a singleton instance
module.exports = new ApiRouter();
