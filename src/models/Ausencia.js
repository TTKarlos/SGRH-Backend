const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Ausencia = sequelize.define(
    "Ausencia",
    {
        id_ausencia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_empleado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_tipo_ausencia: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    },
    {
        tableName: "ausencias",
        timestamps: false,
        indexes: [
            {
                name: "idx_empleado_fechas",
                fields: ["id_empleado", "fecha_inicio", "fecha_fin"],
            },
        ],
    },
)

module.exports = Ausencia
