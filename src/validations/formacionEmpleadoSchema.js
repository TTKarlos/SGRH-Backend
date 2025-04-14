const yup = require("yup")

// Esquema para crear una formación de empleado
const createFormacionEmpleadoSchema = yup.object().shape({
    id_empleado: yup
        .number()
        .required("El ID del empleado es requerido")
        .positive("El ID del empleado debe ser un número positivo")
        .integer("El ID del empleado debe ser un número entero"),

    nombre: yup
        .string()
        .required("El nombre de la formación es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(255, "El nombre no puede exceder los 255 caracteres"),

    es_interna: yup.boolean().default(false).typeError("El campo es_interna debe ser un valor booleano"),

    fecha_inicio: yup
        .date()
        .required("La fecha de inicio es requerida")
        .typeError("La fecha de inicio debe ser una fecha válida"),

    fecha_fin: yup
        .date()
        .nullable()
        .typeError("La fecha de fin debe ser una fecha válida")
        .min(yup.ref("fecha_inicio"), "La fecha de fin debe ser igual o posterior a la fecha de inicio"),
})

// Esquema para actualizar una formación de empleado
const updateFormacionEmpleadoSchema = yup.object().shape({
    id_empleado: yup
        .number()
        .positive("El ID del empleado debe ser un número positivo")
        .integer("El ID del empleado debe ser un número entero"),

    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(255, "El nombre no puede exceder los 255 caracteres"),

    es_interna: yup.boolean().typeError("El campo es_interna debe ser un valor booleano"),

    fecha_inicio: yup.date().typeError("La fecha de inicio debe ser una fecha válida"),

    fecha_fin: yup
        .date()
        .nullable()
        .typeError("La fecha de fin debe ser una fecha válida")
        .min(yup.ref("fecha_inicio"), "La fecha de fin debe ser igual o posterior a la fecha de inicio"),
})

module.exports = {
    createFormacionEmpleadoSchema,
    updateFormacionEmpleadoSchema,
}
