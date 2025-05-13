const yup = require("yup")

// Esquema para crear un convenio
const createConvenioSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre del convenio es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    numero_convenio: yup
        .string()
        .max(50, "El número de convenio no puede exceder los 50 caracteres")
        .nullable(),
})

// Esquema para actualizar un convenio
const updateConvenioSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    numero_convenio: yup
        .string()
        .max(50, "El número de convenio no puede exceder los 50 caracteres")
        .nullable(),
})

module.exports = {
    createConvenioSchema,
    updateConvenioSchema,
}