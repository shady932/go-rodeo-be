"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payment_attempts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      payment_request_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "payment_requests",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      method: {
        type: Sequelize.ENUM("UPI", "CARD", "WALLET", "CASH"),
        allowNull: false,
      },
      vendor: {
        type: Sequelize.ENUM("RAZORPAY", "STRIPE", "PAYTM", "INTERNAL"),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("INITIATED", "SUCCESS", "FAILED"),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
    await queryInterface.addIndex("payment_attempts", {
      fields: ["payment_request_id"],
      name: "idx_pay_req_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("payment_attempts");
  },
};
