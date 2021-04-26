'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.addColumn('Logs', 'companyId', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('Logs', 'siteName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Logs', 'module', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await  queryInterface.removeColumn('Logs', 'companyId', {
        type: Sequelize.UUID,
        allowNull: true,
      });
    await queryInterface.removeColumn('Logs', 'siteName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.removeColumn('Logs', 'module', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
