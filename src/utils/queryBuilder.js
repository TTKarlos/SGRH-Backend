const { Op } = require("sequelize")

/**
 * Construye una cláusula where para búsqueda en múltiples campos
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array<string>} fields - Campos donde buscar
 * @returns {Object} Cláusula where para Sequelize
 */
const buildSearchClause = (searchTerm, fields) => {
    if (!searchTerm || !fields || fields.length === 0) {
        return {}
    }

    const searchConditions = fields.map((field) => ({
        [field]: { [Op.like]: `%${searchTerm}%` },
    }))

    return {
        [Op.or]: searchConditions,
    }
}

/**
 * Construye un objeto de opciones para actualización
 * @param {Object} data - Datos a actualizar
 * @param {Array<string>} allowedFields - Campos permitidos para actualizar
 * @returns {Object} Objeto con campos a actualizar
 */
const buildUpdateObject = (data, allowedFields) => {
    const updateData = {}

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field]
        }
    })

    return updateData
}

/**
 * Construye una cláusula where para filtros
 * @param {Object} filters - Objeto con filtros
 * @returns {Object} Cláusula where para Sequelize
 */
const buildFilterClause = (filters) => {
    const whereClause = {}

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            whereClause[key] = value
        }
    })

    return whereClause
}

module.exports = {
    buildSearchClause,
    buildUpdateObject,
    buildFilterClause,
}

