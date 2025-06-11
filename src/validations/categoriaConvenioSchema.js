const yup = require("yup")

// Esquema para crear una categoría de convenio
const createCategoriaConvenioSchema = yup.object().shape({
    id_convenio: yup
        .number()
        .required("El convenio es requerido")
        .positive("El ID del convenio debe ser un número positivo")
        .integer("El ID del convenio debe ser un número entero"),

    nombre: yup
        .string()
        .required("El nombre de la categoría es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),
    descripcion: yup
    .string()
        .required("La descripcion es obligatoria")
})

// Esquema para actualizar una categoría de convenio
const updateCategoriaConvenioSchema = yup.object().shape({
    id_convenio: yup
        .number()
        .positive("El ID del convenio debe ser un número positivo")
        .integer("El ID del convenio debe ser un número entero"),

    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),
    descripcion: yup
        .string()
        .required("La descripcion es obligatoria")
})

module.exports = {
    createCategoriaConvenioSchema,
    updateCategoriaConvenioSchema,
}