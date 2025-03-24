const Usuario = require("./Usuario")
const Rol = require("./Rol")
const Permiso = require("./Permiso")
const PermisoRol = require("./PermisoRol")
const sequelize = require("../config/database")
const { Sequelize } = require("sequelize")


Rol.hasMany(Usuario, { foreignKey: "id_rol" })
Usuario.belongsTo(Rol, { foreignKey: "id_rol" })

Rol.belongsToMany(Permiso, { through: PermisoRol, foreignKey: "id_rol" })
Permiso.belongsToMany(Rol, { through: PermisoRol, foreignKey: "id_permiso" })

module.exports = {
    Usuario,
    Rol,
    Permiso,
    PermisoRol,
    sequelize,
    Op: Sequelize.Op,
}

