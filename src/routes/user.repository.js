const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

class UserRepository {
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
    }

    setupRoutes() {
        this.router.get('/user', userController.getAll);
        this.router.post('/user', auth, userController.create);
    }

    getRoutes() {
        return this.router;
    }
}

module.exports = new UserRepository();