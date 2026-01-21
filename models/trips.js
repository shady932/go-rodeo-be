"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Trips extends Model {
    static associate(models) {
      Trips.belongsTo(models.Rides, {
        foreignKey: "ride_id",
      });
      Trips.belongsTo(models.Users, {
        foreignKey: "rider_id",
      });
      Trips.belongsTo(models.Drivers, {
        foreignKey: "driver_id",
      });
      Trips.hasOne(models.PaymentRequests, {
        foreignKey: "reference_id",
      });
    }
  }

  Trips.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      rideId: {
        field: "ride_id",
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      riderId: {
        field: "rider_id",
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      driverId: {
        field: "driver_id",
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("ACCEPTED", "STARTED", "PAUSED", "ENDED", "PAID"),
        allowNull: false,
      },
      startTime: {
        field: "start_time",
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        field: "end_time",
        type: DataTypes.DATE,
        allowNull: true,
      },
      fareAmount: {
        field: "fare_amount",
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      baseFare: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: false,
        field: "base_fare",
      },
    },
    {
      sequelize,
      modelName: "Trips",
      tableName: "trips",
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Trips;
};
