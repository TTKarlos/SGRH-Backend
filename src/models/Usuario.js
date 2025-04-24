const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Usuario = sequelize.define(
    "Usuario",
    {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_usuario",
        },
        nombre_usuario: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            field: "nombre_usuario",
            validate: {
                len: [3, 50],
                notEmpty: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: "password_hash",
            validate: {
                len: [8, 255],
            },
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: "email",
            validate: {
                isEmail: true,
                notEmpty: true,
            },
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: "nombre",
            validate: {
                notEmpty: true,
            },
        },
        apellidos: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "apellidos",
            validate: {
                notEmpty: true,
            },
        },
        id_rol: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_rol",
            references: {
                model: "roles",
                key: "id_rol",
            },
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: "activo",
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        tableName: "usuarios",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (usuario) => {
                if (usuario.password_hash) {
                    usuario.password_hash = await Usuario.hashPassword(usuario.password_hash)
                }
            },
            beforeUpdate: async (usuario) => {
                if (usuario.changed("password_hash")) {
                    usuario.password_hash = await Usuario.hashPassword(usuario.password_hash)
                }
            },
        },
    },
)

Usuario.hashPassword = async (password) => {
    return await bcrypt.hash(password, 12)
}

Usuario.prototype.generateAuthToken = async function () {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables")
    }

    const token = jwt.sign(
        {
            id: this.id_usuario,
            role: this.id_rol,
            username: this.nombre_usuario,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        },
    )

    this.token = token
    await this.save()
    return token
}

Usuario.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash)
}

Usuario.prototype.clearToken = function () {
    this.token = null
}

Usuario.prototype.toJSON = function () {
    const values = { ...this.get() }
    delete values.password_hash
    return values
}

Usuario.findByToken = async (token) => {
    try {
        if (!token || !process.env.JWT_SECRET) return null

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return await Usuario.findByPk(decoded.id)
    } catch (error) {
        return null
    }
}

module.exports = Usuario