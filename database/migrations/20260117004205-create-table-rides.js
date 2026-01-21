"use strict";

const { all } = require("axios");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rides", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      rider_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      pickup_lat: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      pickup_lng: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      drop_lat: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      drop_lng: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      assigned_driver_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "drivers",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      status: {
        type: Sequelize.ENUM("REQUESTED", "ASSIGNED", "CANCELLED", "EXPIRED"),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(50),
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

    await queryInterface.addIndex("rides", {
      fields: ["rider_id", "status"],
      name: "idx_rides_user_status",
    });

    await queryInterface.addIndex("rides", {
      fields: ["assigned_driver_id"],
      name: "idx_rides_driver",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("rides");
  },
};
