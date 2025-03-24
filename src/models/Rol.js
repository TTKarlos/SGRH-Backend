const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")


const Rol = sequelize.define(
    "Rol",
    {
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_rol",
        },
        nombre: {
            type: DataTypes.STRING(50),
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
        tableName: "roles",
        timestamps: false,
    },
)

module.exports = Rol

