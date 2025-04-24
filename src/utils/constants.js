//Roles del sistema
const ROLES = {
    ADMIN: "ADMIN",
    GERENTE: "GERENTE",
    RRHH: "RRHH",
    USUARIO: "USUARIO",
}

//Tipos de permisos
const PERMISSION_TYPES = {
    READ: "Lectura",
    WRITE: "Escritura",
}

//Estado empleado
const ESTADO_CIVIL = {
    SOLTERO: "Soltero/a",
    CASADO: "Casado/a",
    DIVORCIADO: "Divorciado/a",
    VIUDO: "Viudo/a",
    OTRO: "Otro",
}

module.exports = {
    ROLES,
    PERMISSION_TYPES,
    ESTADO_CIVIL,
}

