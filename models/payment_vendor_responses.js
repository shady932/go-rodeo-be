"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentVendorResponses extends Model {
    static associate(models) {
      PaymentVendorResponses.hasMany(models.PaymentAttempts, {
        foreignKey: "payment_request_id",
      });
    }
  }

  PaymentVendorResponses.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      paymentAttemptId: {
        field: "payment_attempt_id",
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PaymentVendorResponses",
      tableName: "payment_vendor_responses",
      timestamps: false,
      freezeTableName: true,
    }
  );

  return PaymentVendorResponses;
};
