const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Empleado = sequelize.define(
    "Empleado",
    {
        id_empleado: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "id_empleado",
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: "nombre",
            validate: {
                notEmpty: true,
            },
        },
        apellidos: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "apellidos",
            validate: {
                notEmpty: true,
            },
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: "fecha_nacimiento",
        },
        dni_nie: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
            field: "dni_nie",
            validate: {
                notEmpty: true,
            },
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "direccion",
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: "telefono",
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: "email",
            validate: {
                isEmail: true,
            },
        },
        estado_civil: {
            type: DataTypes.ENUM("Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Otro"),
            allowNull: true,
            field: "estado_civil",
        },
        id_departamento: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "id_departamento",
            references: {
                model: "departamentos",
                key: "id_departamento",
            },
        },
        id_centro: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "id_centro",
            references: {
                model: "centros",
                key: "id_centro",
            },
        },
        puesto_actual: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: "puesto_actual",
        },
        fecha_incorporacion: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: "fecha_incorporacion",
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: "activo",
        },
    },
    {
        tableName: "empleados",
        timestamps: false,
    },
)

module.exports = Empleado

