'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('User', 'RequestedRole', {
      type: Sequelize.ENUM('Tutor', 'Student'),
      allowNull: true,
      defaultValue: 'Student'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('User', 'RequestedRole');
  }
};
