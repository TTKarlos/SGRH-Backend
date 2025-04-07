const yup = require("yup")

// Esquema para crear un empleado
const createEmpleadoSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    apellidos: yup
        .string()
        .required("Los apellidos son requeridos")
        .min(2, "Los apellidos deben tener al menos 2 caracteres")
        .max(100, "Los apellidos no pueden exceder los 100 caracteres"),

    dni_nie: yup
        .string()
        .required("El DNI/NIE es requerido")
        .matches(/^[0-9XYZ][0-9]{7}[A-Z]$/, "El formato del DNI/NIE no es válido"),

    fecha_nacimiento: yup.date().max(new Date(), "La fecha de nacimiento no puede ser futura").nullable(),

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

    estado_civil: yup
        .string()
        .oneOf(["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Otro"], "Estado civil no válido")
        .nullable(),

    id_departamento: yup
        .number()
        .positive("El ID del departamento debe ser un número positivo")
        .integer("El ID del departamento debe ser un número entero")
        .nullable(),

    id_centro: yup
        .number()
        .positive("El ID del centro debe ser un número positivo")
        .integer("El ID del centro debe ser un número entero")
        .nullable(),

    puesto_actual: yup.string().max(100, "El puesto actual no puede exceder los 100 caracteres").nullable(),

    fecha_incorporacion: yup.date().max(new Date(), "La fecha de incorporación no puede ser futura").nullable(),

    activo: yup.boolean().default(true),
})

// Esquema para actualizar un empleado
const updateEmpleadoSchema = yup.object().shape({
    nombre: yup
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    apellidos: yup
        .string()
        .min(2, "Los apellidos deben tener al menos 2 caracteres")
        .max(100, "Los apellidos no pueden exceder los 100 caracteres"),

    dni_nie: yup.string().matches(/^[0-9XYZ][0-9]{7}[A-Z]$/, "El formato del DNI/NIE no es válido"),

    fecha_nacimiento: yup.date().max(new Date(), "La fecha de nacimiento no puede ser futura").nullable(),

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

    estado_civil: yup
        .string()
        .oneOf(["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Otro"], "Estado civil no válido")
        .nullable(),

    id_departamento: yup
        .number()
        .positive("El ID del departamento debe ser un número positivo")
        .integer("El ID del departamento debe ser un número entero")
        .nullable(),

    id_centro: yup
        .number()
        .positive("El ID del centro debe ser un número positivo")
        .integer("El ID del centro debe ser un número entero")
        .nullable(),

    puesto_actual: yup.string().max(100, "El puesto actual no puede exceder los 100 caracteres").nullable(),

    fecha_incorporacion: yup.date().max(new Date(), "La fecha de incorporación no puede ser futura").nullable(),

    activo: yup.boolean(),
})

// Esquema para cambiar el estado de un empleado
const changeStatusSchema = yup.object().shape({
    activo: yup.boolean().required("El estado (activo) es requerido"),
})

module.exports = {
    createEmpleadoSchema,
    updateEmpleadoSchema,
    changeStatusSchema,
}

