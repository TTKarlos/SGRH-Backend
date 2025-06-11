const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Departamento = sequelize.define(
    "Departamento",
    {
        id_departamento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_departamento",
        },
        id_centro: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_centro",
            references: {
                model: "centros",
                key: "id_centro",
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
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "descripcion",
        },
    },
    {
        tableName: "departamentos",
        timestamps: false,
    },
)

module.exports = Departamento

