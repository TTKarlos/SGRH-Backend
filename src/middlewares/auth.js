const jwt = require("jsonwebtoken")
const { Usuario, Rol } = require("../models")
require("dotenv").config()

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization")

        if (!authHeader) {
            throw new Error("No authorization header provided")
        }
        let token
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.replace("Bearer ", "")
        } else if (authHeader.startsWith("Token ")) {
            token = authHeader.replace("Token ", "")
        } else {
            token = authHeader
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not configured")
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await Usuario.findOne({
            where: {
                id_usuario: decoded.id,
                activo: true,
            },
            include: [Rol],
        })

        if (!user) {
            throw new Error("User not found or inactive")
        }
        req.token = token
        req.user = user
        req.userRole = user.Rol
        next()
    } catch (error) {
        console.error("Authentication error:", error.message)
        res.status(401).json({
            success: false,
            message: "Por favor inicie sesión para acceder.",
            error: error.message,
            statusCode: 401,
        })
    }
}

module.exports = auth

