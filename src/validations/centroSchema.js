const yup = require("yup")

// Esquema para crear un centro
const createCentroSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre del centro es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    id_zona: yup
        .number()
        .required("La zona es requerida")
        .positive("El ID de la zona debe ser un número positivo")
        .integer("El ID de la zona debe ser un número entero"),

    direccion: yup.string().max(200, "La dirección no puede exceder los 200 caracteres"),

    telefono: yup
        .string()
        .matches(/^[0-9+\s()-]{6,20}$/, "El formato del teléfono no es válido")
        .nullable(),

    email: yup
        .string()
        .email("Debe ser un email válido")
        .max(100, "El email no puede exceder los 100 caracteres")
        .nullable(),
})

// Esquema para actualizar un centro
const updateCentroSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    id_zona: yup
        .number()
        .positive("El ID de la zona debe ser un número positivo")
        .integer("El ID de la zona debe ser un número entero"),

    direccion: yup.string().max(200, "La dirección no puede exceder los 200 caracteres"),

    telefono: yup
        .string()
        .matches(/^[0-9+\s()-]{6,20}$/, "El formato del teléfono no es válido")
        .nullable(),

    email: yup
        .string()
        .email("Debe ser un email válido")
        .max(100, "El email no puede exceder los 100 caracteres")
        .nullable(),
})

module.exports = {
    createCentroSchema,
    updateCentroSchema,
}

