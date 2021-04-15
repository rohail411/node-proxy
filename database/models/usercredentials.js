'use strict';
const {
  Model,
  Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserCredentials extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserCredentials.init({
    targetUrl: DataTypes.STRING,
    siteName: DataTypes.STRING,
    credentials: {
      type: Sequelize.JSON
    }
  }, {
    sequelize,
    modelName: 'UserCredentials',
  });

  UserCredentials.toJSON = function(){
    return {
      id:this.id,
      siteName:this.siteName,
      credentials:this.credentials,
      createdAt:this.createdAt
    }
  }

  return UserCredentials;
};
