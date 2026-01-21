"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payment_vendor_responses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      payment_attempt_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
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
    await queryInterface.addIndex("payment_vendor_responses", {
      fields: ["payment_attempt_id"],
      name: "idx_pay_atm_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("payment_vendor_responses");
  },
};
