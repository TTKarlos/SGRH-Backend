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
const TipoContrato = require("./TipoContrato")
const Contrato = require("./Contrato")
const Empresa = require("./Empresa")
const Convenio = require("./Convenio")
const CategoriaConvenio = require("./CategoriaConvenio")
const sequelize = require("../config/database")
const { Sequelize } = require("sequelize")

// Relaciones Usuario - Rol
Rol.hasMany(Usuario, { foreignKey: "id_rol" })
Usuario.belongsTo(Rol, { foreignKey: "id_rol" })

// Relaciones Rol - Permiso (muchos a muchos)
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

// Relaciones Empresa - Zona
Empresa.hasMany(Zona, { foreignKey: "id_empresa" })
Zona.belongsTo(Empresa, { foreignKey: "id_empresa" })

// Relaciones Zona - Centro
Zona.hasMany(Centro, { foreignKey: "id_zona" })
Centro.belongsTo(Zona, { foreignKey: "id_zona" })

// Relaciones Centro - Departamento
Centro.hasMany(Departamento, { foreignKey: "id_centro" })
Departamento.belongsTo(Centro, { foreignKey: "id_centro" })

// Relaciones Departamento - Empleado
Departamento.hasMany(Empleado, { foreignKey: "id_departamento" })
Empleado.belongsTo(Departamento, { foreignKey: "id_departamento" })

// Relaciones Centro - Empleado
Centro.hasMany(Empleado, { foreignKey: "id_centro" })
Empleado.belongsTo(Centro, { foreignKey: "id_centro" })

// Relaciones TipoAusencia - Ausencia
TipoAusencia.hasMany(Ausencia, { foreignKey: "id_tipo_ausencia" })
Ausencia.belongsTo(TipoAusencia, { foreignKey: "id_tipo_ausencia" })

// Relaciones Empleado - Ausencia
Empleado.hasMany(Ausencia, { foreignKey: "id_empleado" })
Ausencia.belongsTo(Empleado, { foreignKey: "id_empleado" })

// Relaciones Empleado - FormacionEmpleado
Empleado.hasMany(FormacionEmpleado, { foreignKey: "id_empleado" })
FormacionEmpleado.belongsTo(Empleado, { foreignKey: "id_empleado" })

// Relaciones Empleado - Documento
Empleado.hasMany(Documento, { foreignKey: "id_empleado" })
Documento.belongsTo(Empleado, { foreignKey: "id_empleado" })

// Relaciones TipoContrato - Contrato
TipoContrato.hasMany(Contrato, { foreignKey: "id_tipo_contrato" })
Contrato.belongsTo(TipoContrato, { foreignKey: "id_tipo_contrato" })

// Relaciones Empleado - Contrato
Empleado.hasMany(Contrato, { foreignKey: "id_empleado" })
Contrato.belongsTo(Empleado, { foreignKey: "id_empleado" })

// Relaciones Empresa - Contrato
Empresa.hasMany(Contrato, { foreignKey: "id_empresa" })
Contrato.belongsTo(Empresa, { foreignKey: "id_empresa" })

// Relaciones Convenio - Contrato
Convenio.hasMany(Contrato, { foreignKey: "id_convenio" })
Contrato.belongsTo(Convenio, { foreignKey: "id_convenio" })

// Relaciones CategoriaConvenio - Contrato
CategoriaConvenio.hasMany(Contrato, { foreignKey: "id_categoria" })
Contrato.belongsTo(CategoriaConvenio, { foreignKey: "id_categoria" })

// Relaciones Convenio - CategoriaConvenio
Convenio.hasMany(CategoriaConvenio, { foreignKey: "id_convenio" })
CategoriaConvenio.belongsTo(Convenio, { foreignKey: "id_convenio" })

const Op = Sequelize.Op

module.exports = {
    Usuario,
    Rol,
    Permiso,
    PermisoRol,
    Zona,
    Centro,
    Departamento,
    Empleado,
    TipoAusencia,
    Ausencia,
    FormacionEmpleado,
    Documento,
    TipoContrato,
    Contrato,
    Empresa,
    Convenio,
    CategoriaConvenio,
    sequelize,
    Op,
}