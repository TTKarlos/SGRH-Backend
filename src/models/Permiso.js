const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Permiso = sequelize.define(
    "Permiso",
    {
        id_permiso: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_permiso",
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nombre",
            validate: {
                notEmpty: true,
            },
        },
        tipo: {
            type: DataTypes.ENUM("Lectura", "Escritura"),
            allowNull: false,
            field: "tipo",
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "descripcion",
        },
    },
    {
        tableName: "permisos",
        timestamps: false,
    },
)

module.exports = Permiso

