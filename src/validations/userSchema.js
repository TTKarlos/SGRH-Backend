const yup = require("yup")
const { ROLES } = require("../utils/constants")

const userSchema = yup.object().shape({
    username: yup
        .string()
        .required("El nombre de usuario es requerido")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede tener más de 50 caracteres"),
    email: yup
        .string()
        .required("El email es requerido")
        .email("Debe ser un email válido")
        .max(100, "El email no puede tener más de 100 caracteres"),
    password: yup
        .string()
        .required("La contraseña es requerida")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(255, "La contraseña no puede tener más de 255 caracteres"),
    firstName: yup.string().nullable().max(50, "El nombre no puede tener más de 50 caracteres"),
    lastName: yup.string().nullable().max(50, "El apellido no puede tener más de 50 caracteres"),
    role: yup.string().oneOf(Object.values(ROLES), "Rol no válido").default(ROLES.EMPLOYEE),
    isActive: yup.boolean().default(true),
})

module.exports = userSchema

