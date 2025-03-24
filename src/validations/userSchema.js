const yup = require("yup")

const usuarioSchema = yup.object().shape({
    nombre_usuario: yup
        .string()
        .required("El nombre de usuario es requerido")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede tener más de 50 caracteres"),

    email: yup
        .string()
        .required("El email es requerido")
        .email("Debe ser un email válido")
        .max(100, "El email no puede tener más de 100 caracteres"),

    password_hash: yup
        .string()
        .required("La contraseña es requerida")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(255, "La contraseña no puede tener más de 255 caracteres"),

    nombre: yup.string().required("El nombre es requerido").max(50, "El nombre no puede tener más de 50 caracteres"),

    apellidos: yup
        .string()
        .required("Los apellidos son requeridos")
        .max(100, "Los apellidos no pueden tener más de 100 caracteres"),

    id_rol: yup
        .number()
        .required("El rol es requerido")
        .positive("El rol debe ser un número positivo")
        .integer("El rol debe ser un número entero"),

    activo: yup.boolean().default(true),
})


const loginSchema = yup.object().shape({
    email: yup.string().required("El email o nombre de usuario es requerido"),

    password: yup.string().required("La contraseña es requerida"),
})


const passwordChangeSchema = yup.object().shape({
    currentPassword: yup.string().required("La contraseña actual es requerida"),

    newPassword: yup
        .string()
        .required("La nueva contraseña es requerida")
        .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        .max(255, "La nueva contraseña no puede tener más de 255 caracteres")
        .notOneOf([yup.ref("currentPassword")], "La nueva contraseña debe ser diferente a la actual"),
})

module.exports = {
    usuarioSchema,
    loginSchema,
    passwordChangeSchema,
}

