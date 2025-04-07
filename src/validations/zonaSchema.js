const yup = require("yup")

// Esquema para crear una zona
const createZonaSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre de la zona es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    descripcion: yup.string().max(200, "La descripción no puede exceder los 200 caracteres"),
})

// Esquema para actualizar una zona
const updateZonaSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    descripcion: yup.string().max(200, "La descripción no puede exceder los 200 caracteres"),
})

module.exports = {
    createZonaSchema,
    updateZonaSchema,
}

