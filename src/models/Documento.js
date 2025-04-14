const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Documento = sequelize.define(
    "Documento",
    {
        id_documento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_empleado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipo_documento: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ruta_archivo: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        nombre_original: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        mimetype: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        tamano: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        fecha_subida: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "documentos",
        timestamps: false,
    },
)

module.exports = Documento
