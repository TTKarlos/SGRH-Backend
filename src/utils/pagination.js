/**
 * Función para paginar resultados de consultas Sequelize
 * @param {Object} model - Modelo Sequelize
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} options - Opciones adicionales para la consulta
 * @returns {Promise<Object>} Resultados paginados y metadatos
 */
const paginate = async (model, req, options = {}) => {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit

    const whereClause = options.where || {}

    const count = await model.count({ where: whereClause })

    const queryOptions = {
        ...options,
        limit,
        offset,
    }

    const rows = await model.findAll(queryOptions)

    const totalPages = Math.ceil(count / limit)

    return {
        data: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages,
        },
    }
}

module.exports = {
    paginate,
}

