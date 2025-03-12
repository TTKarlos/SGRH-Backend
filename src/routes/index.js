const express = require("express")
const authRepository = require("./auth.repository")


class RepositoryIndex {
    constructor() {
        this.router = express.Router()
        this.setupRoutes()
    }

    setupRoutes() {
        this.router.use("/auth", authRepository.getRoutes())
    }

    getRoutes() {
        return this.router
    }
}

module.exports = new RepositoryIndex()

