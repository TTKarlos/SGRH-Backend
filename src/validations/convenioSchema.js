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
    descripcion: yup
    .string()
        .required("La descipcion del convenio es requerido"),
    codigo: yup
        .string()
        .required("El codigo del convenio es requerido"),
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
    descripcion: yup
        .string()
        .required("La descipcion del convenio es requerido"),
    codigo: yup
        .string()
        .required("El codigo del convenio es requerido"),
})

module.exports = {
    createConvenioSchema,
    updateConvenioSchema,
}