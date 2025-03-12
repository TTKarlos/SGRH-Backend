const User = require("../models/user")
const { Op } = require("sequelize")
const AppError = require("../utils/appError")

exports.getAll = async (req, res, next) => {
    try {
        const users = await User.findAll()

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
            message: "Usuarios encontrados exitosamente!",
        })
    } catch (error) {
        next(new AppError("Error fetching users", 500))
    }
}

exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await User.findByPk(id)

        if (!user) {
            return next(new AppError(`User with id ${id} not found`, 404))
        }

        res.status(200).json({
            success: true,
            data: user,
            message: "Usuario encontrado exitosamente!",
        })
    } catch (error) {
        next(new AppError("Error fetching user", 500))
    }
}

exports.create = async (req, res, next) => {
    try {
        const { username, email } = req.body

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }],
            },
        })

        if (existingUser) {
            return next(new AppError("El usuario o el correo electrónico ya están registrados.", 400))
        }

        const user = await User.create(req.body)

        res.status(201).json({
            success: true,
            data: user,
            message: "Usuario creado exitosamente!",
        })
    } catch (error) {
        next(new AppError("Error creating user", 500))
    }
}

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params
        const { username, email, ...otherUpdates } = req.body

        const user = await User.findByPk(id)
        if (!user) {
            return next(new AppError(`User with id ${id} not found`, 404))
        }

        if (username || email) {
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [username ? { username } : null, email ? { email } : null].filter(Boolean),
                    id: { [Op.ne]: id },
                },
            })

            if (existingUser) {
                return next(new AppError("El usuario o el correo electrónico ya están registrados.", 400))
            }
        }

        await user.update({ username, email, ...otherUpdates })

        res.status(200).json({
            success: true,
            data: user,
            message: "Usuario actualizado exitosamente!",
        })
    } catch (error) {
        next(new AppError("Error updating user", 500))
    }
}

exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params

        const user = await User.findByPk(id)

        if (!user) {
            return next(new AppError(`User with id ${id} not found`, 404))
        }

        await user.destroy()

        res.status(200).json({
            success: true,
            message: `Usuario con id: ${id} eliminado exitosamente!`,
        })
    } catch (error) {
        next(new AppError("Error deleting user", 500))
    }
}

