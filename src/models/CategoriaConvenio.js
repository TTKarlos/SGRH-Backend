const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const CategoriaConvenio = sequelize.define(
    "CategoriaConvenio",
    {
        id_categoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_categoria",
        },
        id_convenio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_convenio",
            references: {
                model: "convenios",
                key: "id_convenio",
            },
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nombre",
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "descripcion",
        },
    },
    {
        tableName: "categorias_convenio",
        timestamps: false,
    },
)

module.exports = CategoriaConvenio