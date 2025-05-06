const yup = require("yup")

// Esquema para crear una ausencia
const createAusenciaSchema = yup.object().shape({
    id_empleado: yup
        .number()
        .required("El ID del empleado es requerido")
        .positive("El ID del empleado debe ser un número positivo")
        .integer("El ID del empleado debe ser un número entero"),

    id_tipo_ausencia: yup
        .number()
        .required("El tipo de ausencia es requerido")
        .positive("El ID del tipo de ausencia debe ser un número positivo")
        .integer("El ID del tipo de ausencia debe ser un número entero"),

    fecha_inicio: yup
        .date()
        .required("La fecha de inicio es requerida")
        .typeError("La fecha de inicio debe ser una fecha válida"),

    fecha_fin: yup
        .date()
        .min(yup.ref("fecha_inicio"), "La fecha de fin debe ser igual o posterior a la fecha de inicio"),
})

// Esquema para actualizar una ausencia
const updateAusenciaSchema = yup.object().shape({
    id_empleado: yup
        .number()
        .positive("El ID del empleado debe ser un número positivo")
        .integer("El ID del empleado debe ser un número entero"),

    id_tipo_ausencia: yup
        .number()
        .positive("El ID del tipo de ausencia debe ser un número positivo")
        .integer("El ID del tipo de ausencia debe ser un número entero"),

    fecha_inicio: yup.date().typeError("La fecha de inicio debe ser una fecha válida"),

    fecha_fin: yup
        .date()
        .min(yup.ref("fecha_inicio"), "La fecha de fin debe ser igual o posterior a la fecha de inicio"),
})

module.exports = {
    createAusenciaSchema,
    updateAusenciaSchema,
}
