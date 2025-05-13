const yup = require("yup")

// Esquema para crear una empresa
const createEmpresaSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre de la empresa es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    cif: yup
        .string()
        .required("El CIF es requerido")
        .min(5, "El CIF debe tener al menos 5 caracteres")
        .max(20, "El CIF no puede exceder los 20 caracteres"),

    direccion: yup
        .string()
        .max(255, "La dirección no puede exceder los 255 caracteres")
        .nullable(),

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

// Esquema para actualizar una empresa
const updateEmpresaSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    cif: yup
        .string()
        .min(5, "El CIF debe tener al menos 5 caracteres")
        .max(20, "El CIF no puede exceder los 20 caracteres"),

    direccion: yup
        .string()
        .max(255, "La dirección no puede exceder los 255 caracteres")
        .nullable(),

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
    createEmpresaSchema,
    updateEmpresaSchema,
}