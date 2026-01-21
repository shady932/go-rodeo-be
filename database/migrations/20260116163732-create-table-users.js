"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR",
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
    await queryInterface.addIndex("users", {
      name: "idx_unq_phone",
      fields: [
        {
          name: "phone",
          length: 20,
        },
      ],
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
