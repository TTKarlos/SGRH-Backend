const yup = require("yup")

// Esquema para crear un tipo de contrato
const createTipoContratoSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre del tipo de contrato es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    codigo: yup
        .string()
        .required("El código del tipo de contrato es requerido")
        .min(1, "El código debe tener al menos 1 caracter")
        .max(20, "El código no puede exceder los 20 caracteres"),

    descripcion: yup
    .string()
})

// Esquema para actualizar un tipo de contrato
const updateTipoContratoSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    codigo: yup
        .string()
        .min(1, "El código debe tener al menos 1 caracter")
        .max(20, "El código no puede exceder los 20 caracteres"),

    descripcion: yup
        .string()
})

module.exports = {
    createTipoContratoSchema,
    updateTipoContratoSchema,
}