"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentAttempts extends Model {
    static associate(models) {
      PaymentAttempts.belongsTo(models.PaymentRequests, {
        foreignKey: "payment_request_id",
      });
    }
  }

  PaymentAttempts.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      paymentRequestId: {
        field: "payment_request_id",
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "payment_requests",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      method: {
        type: DataTypes.ENUM("UPI", "CARD", "WALLET", "CASH"),
        allowNull: false,
      },
      vendor: {
        type: DataTypes.ENUM("RAZORPAY", "STRIPE", "PAYTM", "INTERNAL"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("INITIATED", "SUCCESS", "FAILED"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PaymentAttempts",
      tableName: "payment_attempts",
      timestamps: false,
      freezeTableName: true,
    }
  );

  return PaymentAttempts;
};
