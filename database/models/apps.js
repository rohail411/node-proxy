'use strict';
const {
  Model,
  Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class apps extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  apps.init({
    targetUrl: DataTypes.STRING,
    body: Sequelize.JSONB,
  }, {
    sequelize,
    modelName: 'apps',
  });
  return apps;
};