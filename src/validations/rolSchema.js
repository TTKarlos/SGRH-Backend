const yup = require("yup")

// Esquema para crear un rol
const createRolSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre del rol es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder los 50 caracteres"),

    descripcion: yup.string().max(200, "La descripción no puede exceder los 200 caracteres"),

    permisos: yup
        .array()
        .of(
            yup
                .number()
                .positive("El ID del permiso debe ser un número positivo")
                .integer("El ID del permiso debe ser un número entero"),
        ),
})

// Esquema para actualizar un rol
const updateRolSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder los 50 caracteres"),

    descripcion: yup.string().max(200, "La descripción no puede exceder los 200 caracteres"),

    permisos: yup
        .array()
        .of(
            yup
                .number()
                .positive("El ID del permiso debe ser un número positivo")
                .integer("El ID del permiso debe ser un número entero"),
        ),
})

// Esquema para actualizar permisos de un rol
const updatePermisosSchema = yup.object().shape({
    permisos: yup
        .array()
        .of(
            yup
                .number()
                .positive("El ID del permiso debe ser un número positivo")
                .integer("El ID del permiso debe ser un número entero"),
        )
        .required("El array de permisos es requerido"),
})

module.exports = {
    createRolSchema,
    updateRolSchema,
    updatePermisosSchema,
}

