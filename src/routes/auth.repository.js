const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

class AuthRepository {
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.post('/login', authController.login);
        this.router.post('/logout', auth, authController.logout);
    }

    getRoutes() {
        return this.router;
    }
}

module.exports = new AuthRepository();