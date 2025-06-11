const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Centro = sequelize.define(
    "Centro",
    {
        id_centro: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_centro",
        },
        id_zona: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_zona",
            references: {
                model: "zonas",
                key: "id_zona",
            },
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nombre",
            validate: {
                notEmpty: true,
            },
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "direccion",
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: "telefono",
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: "email",
            validate: {
                isEmail: true,
            },
        },
    },
    {
        tableName: "centros",
        timestamps: false,
    },
)

module.exports = Centro

