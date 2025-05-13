const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Contrato = sequelize.define(
    "Contrato",
    {
        id_contrato: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_contrato",
        },
        id_empleado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_empleado",
            references: {
                model: "empleados",
                key: "id_empleado",
            },
        },
        id_tipo_contrato: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_tipo_contrato",
            references: {
                model: "tipos_contrato",
                key: "id_tipo_contrato",
            },
        },
        id_empresa: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_empresa",
            references: {
                model: "empresas",
                key: "id_empresa",
            },
        },
        id_convenio: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "id_convenio",
            references: {
                model: "convenios",
                key: "id_convenio",
            },
        },
        id_categoria: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "id_categoria",
            references: {
                model: "categorias_convenio",
                key: "id_categoria",
            },
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: "fecha_inicio",
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: "fecha_fin",
        },
        fin_periodo_prueba: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: "fin_periodo_prueba",
        },
        antiguedad_contrato: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: "antiguedad_contrato",
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "fecha_creacion",
        },
        ruta_archivo: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: "ruta_archivo",
        },
        nombre_original: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "nombre_original",
        },
        mimetype: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: "mimetype",
        },
        tamano: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: "tamano",
        },
    },
    {
        tableName: "contratos",
        timestamps: false,
    },
)

module.exports = Contrato