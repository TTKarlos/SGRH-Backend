const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Zona = sequelize.define(
    "Zona",
    {
        id_zona: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_zona",
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nombre",
            validate: {
                notEmpty: true,
            },
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "descripcion",
        },
    },
    {
        tableName: "zonas",
        timestamps: false,
    },
)

module.exports = Zona

