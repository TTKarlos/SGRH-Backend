const Usuario = require("./Usuario")
const Rol = require("./Rol")
const Permiso = require("./Permiso")
const PermisoRol = require("./PermisoRol")
const Zona = require("./Zona")
const Centro = require("./Centro")
const Departamento = require("./Departamento")
const Empleado = require("./Empleado")
const TipoAusencia = require("./TipoAusencia")
const Ausencia = require("./Ausencia")
const FormacionEmpleado = require("./FormacionEmpleado")
const Documento = require("./Documento")
const sequelize = require("../config/database")
const { Sequelize } = require("sequelize")

// Relaciones existentes
Rol.hasMany(Usuario, { foreignKey: "id_rol" })
Usuario.belongsTo(Rol, { foreignKey: "id_rol" })

Rol.belongsToMany(Permiso, {
    through: PermisoRol,
    foreignKey: "id_rol",
    otherKey: "id_permiso",
})
Permiso.belongsToMany(Rol, {
    through: PermisoRol,
    foreignKey: "id_permiso",
    otherKey: "id_rol",
})

Zona.hasMany(Centro, { foreignKey: "id_zona" })
Centro.belongsTo(Zona, { foreignKey: "id_zona" })

Centro.hasMany(Departamento, { foreignKey: "id_centro" })
Departamento.belongsTo(Centro, { foreignKey: "id_centro" })

Departamento.hasMany(Empleado, { foreignKey: "id_departamento" })
Empleado.belongsTo(Departamento, { foreignKey: "id_departamento" })

Centro.hasMany(Empleado, { foreignKey: "id_centro" })
Empleado.belongsTo(Centro, { foreignKey: "id_centro" })

TipoAusencia.hasMany(Ausencia, { foreignKey: "id_tipo_ausencia" })
Ausencia.belongsTo(TipoAusencia, { foreignKey: "id_tipo_ausencia" })

Empleado.hasMany(Ausencia, { foreignKey: "id_empleado" })
Ausencia.belongsTo(Empleado, { foreignKey: "id_empleado" })

Empleado.hasMany(FormacionEmpleado, { foreignKey: "id_empleado" })
FormacionEmpleado.belongsTo(Empleado, { foreignKey: "id_empleado" })

Empleado.hasMany(Documento, { foreignKey: "id_empleado" })
Documento.belongsTo(Empleado, { foreignKey: "id_empleado" })

const Op = Sequelize.Op

module.exports = {
    Usuario,
    Rol,
    Permiso,
    PermisoRol,
    sequelize,
    Zona,
    Centro,
    Departamento,
    Empleado,
    TipoAusencia,
    Ausencia,
    FormacionEmpleado,
    Documento,
    Op,
}
