'use strict';

const { ROLES } = require('../../src/utils/constants.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('Users', 'role', {
        type: Sequelize.ENUM(...Object.values(ROLES)),
        allowNull: false,
        defaultValue: ROLES.GERENTE
      }, { transaction });

      await queryInterface.addConstraint('Users', {
        fields: ['role'],
        type: 'check',
        where: {
          role: Object.values(ROLES)
        },
        name: 'Users_role_check',
        transaction
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('Users', 'Users_role_check', { transaction });

      await queryInterface.changeColumn('Users', 'role', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ROLES.GERENTE
      }, { transaction });

      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};