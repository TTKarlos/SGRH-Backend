const yup = require("yup")

// Esquema para login
const loginSchema = yup.object().shape({
    email: yup.string().required("El email o nombre de usuario es requerido"),

    password: yup.string().required("La contraseña es requerida"),

    remember: yup.boolean().default(false),
})

// Esquema para cambio de contraseña
const changePasswordSchema = yup.object().shape({
    currentPassword: yup.string().required("La contraseña actual es requerida"),

    newPassword: yup
        .string()
        .required("La nueva contraseña es requerida")
        .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
        .max(100, "La nueva contraseña no puede exceder los 100 caracteres")
        .notOneOf([yup.ref("currentPassword")], "La nueva contraseña debe ser diferente a la actual"),
})

module.exports = {
    loginSchema,
    changePasswordSchema,
}

