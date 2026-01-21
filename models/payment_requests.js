"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentRequests extends Model {
    static associate(models) {
      PaymentRequests.hasMany(models.PaymentAttempts, {
        foreignKey: "payment_request_id",
      });
    }
  }

  PaymentRequests.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      referenceType: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "TRIP",
        field: "reference_type",
      },
      referenceId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "reference_id",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
      city: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("REQUESTED", "PAID", "CANCELLED"),
        allowNull: false,
        defaultValue: "REQUESTED",
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: "PaymentRequests",
      tableName: "payment_requests",
      timestamps: false,
      freezeTableName: true,
    }
  );

  return PaymentRequests;
};
