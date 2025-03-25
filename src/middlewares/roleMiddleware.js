const { createResponse } = require("../utils/responseHelpers")

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json(createResponse(false, "No autorizado: Usuario no autenticado", null, 401))
    }

    if (req.user.id_rol !== 1) {
        return res
            .status(403)
            .json(createResponse(false, "Acceso denegado: Se requieren permisos de administrador", null, 403))
    }

    next()
}

const hasRole = (roles) => {
    const roleIds = Array.isArray(roles) ? roles : [roles]

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(createResponse(false, "No autorizado: Usuario no autenticado", null, 401))
        }

        if (!roleIds.includes(req.user.id_rol)) {
            return res.status(403).json(createResponse(false, "Acceso denegado: No tiene el rol requerido", null, 403))
        }


        next()
    }
}

module.exports = {
    isAdmin,
    hasRole,
}

