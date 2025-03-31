const Usuario = require("./Usuario")
const Rol = require("./Rol")
const Permiso = require("./Permiso")
const PermisoRol = require("./PermisoRol")
const Zona = require("./Zona")
const Centro = require("./Centro")
const Departamento = require("./Departamento")
const Empleado = require("./Empleado")
const sequelize = require("../config/database")
const { Sequelize } = require("sequelize")

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
    Op,
}

