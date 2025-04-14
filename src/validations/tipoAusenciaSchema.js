const yup = require("yup")

// Esquema para crear un tipo de ausencia
const createTipoAusenciaSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre del tipo de ausencia es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),
})

// Esquema para actualizar un tipo de ausencia
const updateTipoAusenciaSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),
})

module.exports = {
    createTipoAusenciaSchema,
    updateTipoAusenciaSchema,
}
