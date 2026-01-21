"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Drivers extends Model {
    static associate(models) {
      Drivers.hasMany(models.Rides, { foreignKey: "assigned_driver_id" });
      Drivers.hasMany(models.Trips, { foreignKey: "driver_id" });
    }
  }

  Drivers.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "user_id",
      },
      vehicleType: {
        field: "vehicle_type",
        type: DataTypes.ENUM("BIKE", "AUTO", "CAR"),
        allowNull: false,
      },
      vehicleId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "vehicle_id",
      },
      active: {
        field: "is_active",
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Drivers",
      tableName: "drivers",
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Drivers;
};
