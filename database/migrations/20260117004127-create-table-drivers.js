"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("drivers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      vehicle_type: {
        type: Sequelize.ENUM("BIKE", "AUTO", "CAR"),
        allowNull: false,
      },
      vehicle_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.addIndex("drivers", {
      name: "uniq_active_user",
      fields: ["user_id", "active"],
      unique: true,
    });

    await queryInterface.addIndex("drivers", {
      name: "uniq_active_vehicle",
      fields: ["vehicle_id", "active"],
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("drivers");
  },
};
