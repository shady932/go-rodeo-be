"use strict";

const { type } = require("express/lib/response");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("trips", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      ride_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          model: "rides",
          key: "id",
        },
        onDelete: "RESTRICT",
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
      driver_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "drivers",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      status: {
        type: Sequelize.ENUM("ACCEPTED", "STARTED", "PAUSED", "ENDED", "PAID"),
        allowNull: false,
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fare_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      base_fare: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
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

    await queryInterface.addIndex("trips", {
      fields: ["driver_id"],
      name: "idx_trips_driver",
    });

    await queryInterface.addIndex("trips", {
      fields: ["status"],
      name: "idx_trips_status",
    });

    await queryInterface.addIndex("trips", {
      fields: ["rider_id"],
      name: "idx_trips_rider",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("trips");
  },
};
