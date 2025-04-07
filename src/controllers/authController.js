const { Usuario, Op } = require("../models")
const AppError = require("../utils/AppError")
const { createResponse, validateFields, asyncHandler } = require("../utils/responseHelpers")
const { buildSearchClause } = require("../utils/queryBuilder")

const authController = {
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body

        validateFields(["email", "password"], req.body)

        const searchClause = buildSearchClause(email, ["email", "nombre_usuario"])

        const user = await Usuario.findOne({
            where: {
                ...searchClause,
                activo: true,
            },
        })

        if (!user) {
            throw new AppError("Usuario no encontrado o inactivo", 401)
        }

        const isValidPassword = await user.validPassword(password)

        if (!isValidPassword) {
            throw new AppError("Contraseña incorrecta", 401)
        }

        const token = await user.generateAuthToken()

        return res.status(200).json(
            createResponse(true, "Inicio de sesión exitoso", {
                user: {
                    id_usuario: user.id_usuario,
                    nombre_usuario: user.nombre_usuario,
                    email: user.email,
                    nombre: user.nombre,
                    apellidos: user.apellidos,
                    id_rol: user.id_rol,
                    activo: user.activo,
                    token,
                },
            }),
        )
    }),

    // Descomentar en caso de uso
    /*
      register: asyncHandler(async (req, res) => {
          const { nombre_usuario, email, password_hash, nombre, apellidos, id_rol } = req.body

          validateFields(["nombre_usuario", "email", "password_hash", "nombre", "apellidos"], req.body)

          // Verificar si el usuario ya existe
          const existingUser = await Usuario.findOne({
              where: {
                  [Op.or]: [
                      { nombre_usuario },
                      { email }
                  ]
              }
          })

          if (existingUser) {
              throw new AppError("El usuario ya existe con este email o nombre de usuario", 400)
          }

          const user = await Usuario.create({
              nombre_usuario,
              email,
              password_hash,
              nombre,
              apellidos,
              id_rol: id_rol || 4,
              activo: true
          })

          const token = await user.generateAuthToken()

          return res.status(201).json(
              createResponse(true, "Usuario registrado exitosamente", {
                  user: {
                      id_usuario: user.id_usuario,
                      nombre_usuario: user.nombre_usuario,
                      email: user.email,
                      nombre: user.nombre,
                      apellidos: user.apellidos,
                      id_rol: user.id_rol,
                      activo: user.activo,
                      token
                  }
              }, 201)
          )
      }),
      */

    logout: asyncHandler(async (req, res) => {
        await req.user.clearToken()
        await req.user.save()

        return res.status(200).json(createResponse(true, "Sesión cerrada exitosamente"))
    }),

    profile: asyncHandler(async (req, res) => {
        return res.status(200).json(
            createResponse(true, "Perfil de usuario", {
                user: {
                    id_usuario: req.user.id_usuario,
                    nombre_usuario: req.user.nombre_usuario,
                    email: req.user.email,
                    nombre: req.user.nombre,
                    apellidos: req.user.apellidos,
                    id_rol: req.user.id_rol,
                    activo: req.user.activo,
                },
            }),
        )
    }),

    changePassword: asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body

        validateFields(["currentPassword", "newPassword"], req.body)

        if (!(await req.user.validPassword(currentPassword))) {
            throw new AppError("La contraseña actual es incorrecta", 400)
        }

        req.user.password_hash = newPassword
        await req.user.save()

        return res.status(200).json(createResponse(true, "Contraseña actualizada exitosamente"))
    }),
}

module.exports = authController

