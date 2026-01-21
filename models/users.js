"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Rides, { foreignKey: "rider_id" });
      Users.hasMany(models.Trips, { foreignKey: "rider_id" });
    }
  }

  Users.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "users",
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Users;
};
