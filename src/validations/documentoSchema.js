const yup = require("yup")

// Esquema para crear un documento
const createDocumentoSchema = yup.object().shape({
    id_empleado: yup
        .number()
        .required("El ID del empleado es requerido")
        .positive("El ID del empleado debe ser un número positivo")
        .integer("El ID del empleado debe ser un número entero"),

    nombre: yup
        .string()
        .required("El nombre del documento es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(255, "El nombre no puede exceder los 255 caracteres"),

    observaciones: yup.string().nullable().max(1000, "Las observaciones no pueden exceder los 1000 caracteres"),
})

// Esquema para actualizar un documento
const updateDocumentoSchema = yup.object().shape({
    id_empleado: yup
        .number()
        .positive("El ID del empleado debe ser un número positivo")
        .integer("El ID del empleado debe ser un número entero"),

    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(255, "El nombre no puede exceder los 255 caracteres"),

    observaciones: yup.string().nullable().max(1000, "Las observaciones no pueden exceder los 1000 caracteres"),
})

module.exports = {
    createDocumentoSchema,
    updateDocumentoSchema,
}