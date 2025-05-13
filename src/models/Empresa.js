const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Empresa = sequelize.define(
    "Empresa",
    {
        id_empresa: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_empresa",
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nombre",
        },
        cif: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            field: "cif",
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
        },
    },
    {
        tableName: "empresas",
        timestamps: false,
    },
)

module.exports = Empresa