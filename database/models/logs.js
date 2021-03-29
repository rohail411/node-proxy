'use strict';
const {
  Model,
  Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Logs.init({
    method: DataTypes.STRING,
    body: {
      type: Sequelize.JSONB
    },
    params: {
      type: Sequelize.JSONB,
    },
    queryParams: {
      type: Sequelize.JSONB,
    },
    url: {
      type:DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Logs',
  });
  return Logs;
};
