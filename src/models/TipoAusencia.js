const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const TipoAusencia = sequelize.define(
    "TipoAusencia",
    {
        id_tipo_ausencia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        tableName: "tipos_ausencia",
        timestamps: false,
    },
)

module.exports = TipoAusencia
