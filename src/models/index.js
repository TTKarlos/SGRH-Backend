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
const fs = require("fs-extra")

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

Empleado.hasMany(Ausencia, {
    foreignKey: "id_empleado",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
Ausencia.belongsTo(Empleado, { foreignKey: "id_empleado" })

Empleado.hasMany(FormacionEmpleado, {
    foreignKey: "id_empleado",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
FormacionEmpleado.belongsTo(Empleado, { foreignKey: "id_empleado" })

Empleado.hasMany(Documento, {
    foreignKey: "id_empleado",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
Documento.belongsTo(Empleado, { foreignKey: "id_empleado" })

TipoContrato.hasMany(Contrato, { foreignKey: "id_tipo_contrato" })
Contrato.belongsTo(TipoContrato, { foreignKey: "id_tipo_contrato" })

Empleado.hasMany(Contrato, {
    foreignKey: "id_empleado",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
Contrato.belongsTo(Empleado, { foreignKey: "id_empleado" })

Empresa.hasMany(Contrato, { foreignKey: "id_empresa" })
Contrato.belongsTo(Empresa, { foreignKey: "id_empresa" })

Convenio.hasMany(Contrato, { foreignKey: "id_convenio" })
Contrato.belongsTo(Convenio, { foreignKey: "id_convenio" })

CategoriaConvenio.hasMany(Contrato, { foreignKey: "id_categoria" })
Contrato.belongsTo(CategoriaConvenio, { foreignKey: "id_categoria" })

Convenio.hasMany(CategoriaConvenio, { foreignKey: "id_convenio" })
CategoriaConvenio.belongsTo(Convenio, { foreignKey: "id_convenio" })

Empleado.addHook('beforeDestroy', async (empleado, options) => {
    try {

        const documentos = await Documento.findAll({
            where: { id_empleado: empleado.id_empleado }
        });

        const contratos = await Contrato.findAll({
            where: { id_empleado: empleado.id_empleado }
        });

        for (const documento of documentos) {
            if (documento.ruta_archivo) {
                try {
                    await fs.access(documento.ruta_archivo);
                    await fs.unlink(documento.ruta_archivo);
                } catch (error) {
                    console.warn(`Error al eliminar archivo de documento: ${error.message}`);
                }
            }
        }

        for (const contrato of contratos) {
            if (contrato.ruta_archivo) {
                try {
                    await fs.access(contrato.ruta_archivo);
                    await fs.unlink(contrato.ruta_archivo);
                } catch (error) {
                    console.warn(`Error al eliminar archivo de contrato: ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.error(`Error en hook beforeDestroy para empleado ${empleado.id_empleado}:`, error);
    }
});

Documento.addHook('beforeDestroy', async (documento, options) => {
    if (documento.ruta_archivo) {
        try {
            await fs.access(documento.ruta_archivo);
            await fs.unlink(documento.ruta_archivo);
        } catch (error) {
            console.warn(`Error al eliminar archivo de documento: ${error.message}`);
        }
    }
});

Contrato.addHook('beforeDestroy', async (contrato, options) => {
    if (contrato.ruta_archivo) {
        try {
            await fs.access(contrato.ruta_archivo);
            await fs.unlink(contrato.ruta_archivo);
        } catch (error) {
            console.warn(`Error al eliminar archivo de contrato: ${error.message}`);
        }
    }
});

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