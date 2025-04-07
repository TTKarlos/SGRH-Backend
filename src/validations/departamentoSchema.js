const yup = require("yup")

// Esquema para crear un departamento
const createDepartamentoSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre del departamento es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    id_centro: yup
        .number()
        .required("El centro es requerido")
        .positive("El ID del centro debe ser un número positivo")
        .integer("El ID del centro debe ser un número entero"),

    descripcion: yup.string().max(500, "La descripción no puede exceder los 500 caracteres"),

    activo: yup.boolean().default(true),
})

// Esquema para actualizar un departamento
const updateDepartamentoSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    id_centro: yup
        .number()
        .positive("El ID del centro debe ser un número positivo")
        .integer("El ID del centro debe ser un número entero"),

    descripcion: yup.string().max(500, "La descripción no puede exceder los 500 caracteres"),

    activo: yup.boolean(),
})

// Esquema para cambiar el estado de un departamento
const changeStatusSchema = yup.object().shape({
    activo: yup.boolean().required("El estado (activo) es requerido"),
})

module.exports = {
    createDepartamentoSchema,
    updateDepartamentoSchema,
    changeStatusSchema,
}

