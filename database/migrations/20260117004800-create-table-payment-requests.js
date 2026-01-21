"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payment_requests", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      reference_type: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "TRIP",
      },
      reference_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
      city: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("REQUESTED", "PAID", "CANCELLED"),
        allowNull: false,
        defaultValue: "REQUESTED",
      },
      meta: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
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
    await queryInterface.addIndex("payment_requests", {
      fields: ["reference_id", "reference_type"],
      unique: true,
      name: "idx_unq_refrence_id_type",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("payment_requests");
  },
};
