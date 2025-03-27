const { Usuario, sequelize, Op } = require("../models")
const { createResponse, validateFields } = require("../utils/responseHelpers")
const jwt = require("jsonwebtoken")
require("dotenv").config()


const authController = {

    login: async (req, res, next) => {
        try {
            const {email, password} = req.body
            validateFields(["email", "password"], req.body)
            const user = await Usuario.findOne({
                where: {
                    [Op.or]: [
                        {email},
                        {nombre_usuario: email},
                    ],
                    activo: true,
                },
            })
            if (!user) {
                return res.status(401).json(createResponse(false, "Usuario no encontrado o inactivo", null, 401))
            }
            const isValidPassword = await user.validPassword(password)
            if (!isValidPassword) {
                return res.status(401).json(createResponse(false, "Contraseña incorrecta", null, 401))
            }
            let token = user.token
            if (!token) {
                token = await user.generateAuthToken()
            } else {
                try {
                    jwt.verify(token, process.env.JWT_SECRET)
                } catch (error) {
                    token = await user.generateAuthToken()
                }
            }
            res.status(200).json(
                createResponse(true, "Inicio de sesión exitoso PRUEBA", {
                    user: {
                        id_usuario: user.id_usuario,
                        nombre_usuario: user.nombre_usuario,
                        email: user.email,
                        nombre: user.nombre,
                        apellidos: user.apellidos,
                        id_rol: user.id_rol,
                        activo: user.activo,
                        token: token,
                    },
                }),
            )
        } catch (error) {
            console.error("Login error:", error)
            next(error)
        }
    },
//Descomentar en caso de uso
    /*
    register: async (req, res, next) => {
        try {
            const { nombre_usuario, email, password_hash, nombre, apellidos, id_rol } = req.body
            validateFields(["nombre_usuario", "email", "password_hash", "nombre", "apellidos"], req.body)
            const existingUser = await Usuario.findOne({
                where: {
                    [Op.or]: [{ nombre_usuario }, { email }],
                },
            })
            if (existingUser) {
                return res
                    .status(400)
                    .json(createResponse(false, "El usuario ya existe con este email o nombre de usuario", null, 400))
            }
            const user = await Usuario.create({
                nombre_usuario,
                email,
                password_hash,
                nombre,
                apellidos,
                id_rol: id_rol || 4,
                activo: true,
            })
            const token = await user.generateAuthToken()
            res.status(201).json(
                createResponse(
                    true,
                    "Usuario registrado exitosamente",
                    {
                        user: {
                            id_usuario: user.id_usuario,
                            nombre_usuario: user.nombre_usuario,
                            email: user.email,
                            nombre: user.nombre,
                            apellidos: user.apellidos,
                            id_rol: user.id_rol,
                            activo: user.activo,
                            token: token,
                        },
                    },
                    201,
                ),
            )
        } catch (error) {
            console.error("Registration error:", error)
            next(error)
        }
    },
*/
    logout: async (req, res, next) => {
        try {
            req.user.clearToken()
            await req.user.save()
            res.json(createResponse(true, "Sesión cerrada exitosamente"))
        } catch (error) {
            console.error("Logout error:", error)
            next(error)
        }
    },

    profile: async (req, res, next) => {
        try {
            res.json(
                createResponse(true, "Perfil de usuario", {
                    user: {
                        id_usuario: req.user.id_usuario,
                        nombre_usuario: req.user.nombre_usuario,
                        email: req.user.email,
                        nombre: req.user.nombre,
                        apellidos: req.user.apellidos,
                        id_rol: req.user.id_rol,
                        activo: req.user.activo,
                        token: req.user.token,
                    },
                }),
            )
        } catch (error) {
            console.error("Profile error:", error)
            next(error)
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body
            validateFields(["currentPassword", "newPassword"], req.body)
            if (!(await req.user.validPassword(currentPassword))) {
                return res.status(400).json(createResponse(false, "La contraseña actual es incorrecta", null, 400))
            }
            req.user.password_hash = newPassword
            await req.user.save()
            res.json(createResponse(true, "Contraseña actualizada exitosamente"))
        } catch (error) {
            console.error("Change password error:", error)
            next(error)
        }
    },
}

module.exports = authController

