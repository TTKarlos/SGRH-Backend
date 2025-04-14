const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const FormacionEmpleado = sequelize.define(
    "FormacionEmpleado",
    {
        id_formacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_empleado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        es_interna: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    },
    {
        tableName: "formacion_empleado",
        timestamps: false,
    },
)

module.exports = FormacionEmpleado
