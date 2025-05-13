const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const TipoContrato = sequelize.define(
    "TipoContrato",
    {
        id_tipo_contrato: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_tipo_contrato",
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nombre",
        },
        codigo: {
            type: DataTypes.STRING(20),
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
        tableName: "tipos_contrato",
        timestamps: false,
    },
)

module.exports = TipoContrato