const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Convenio = sequelize.define(
    "Convenio",
    {
        id_convenio: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_convenio",
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nombre",
        },
        codigo: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: "codigo",
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "descripcion",
        },
    },
    {
        tableName: "convenios",
        timestamps: false,
    },
)

module.exports = Convenio