"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Rides extends Model {
    static associate(models) {
      Rides.belongsTo(models.Users, {
        foreignKey: "rider_id",
      });
      Rides.belongsTo(models.Drivers, {
        foreignKey: "assigned_driver_id",
      });
      Rides.hasOne(models.Trips, {
        foreignKey: "ride_id",
      });
    }
  }

  Rides.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      riderId: {
        field: "rider_id",
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      pickupLat: {
        field: "pickup_lat",
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
      },
      pickupLng: {
        field: "pickup_lng",
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
      },
      dropLat: {
        field: "drop_lat",
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
      },
      dropLng: {
        field: "drop_lng",
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
      },
      assignedDriverId: {
        field: "assigned_driver_id",
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("REQUESTED", "ASSIGNED", "CANCELLED", "EXPIRED"),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Rides",
      tableName: "rides",
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Rides;
};
