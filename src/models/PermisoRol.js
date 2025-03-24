const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")


const PermisoRol = sequelize.define(
    "PermisoRol",
    {
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: "id_rol",
            references: {
                model: "roles",
                key: "id_rol",
            },
        },
        id_permiso: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: "id_permiso",
            references: {
                model: "permisos",
                key: "id_permiso",
            },
        },
    },
    {
        tableName: "permisos_rol",
        timestamps: false,
    },
)

module.exports = PermisoRol

