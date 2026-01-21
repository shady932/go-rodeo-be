"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const db = {};
const sequelize = new Sequelize(process.env.DB_NAME, null, null, {
  dialect: "mysql",
  port: process.env.DB_PORT,
  replication: {
    read: [
      {
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    ],
    write: {
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  logging: false,
  retry: {
    match: [
      /Deadlock/i,
      Sequelize.ConnectionError,
      Sequelize.ConnectionRefusedError,
      Sequelize.ConnectionTimedOutError,
      Sequelize.TimeoutError,
    ],
    max: 2,
    backoffBase: 2000,
    backoffExponent: 2,
  },
});

const baseModelPath = `${__dirname}/../models`;

fs.readdirSync(baseModelPath)
  .filter((file) => {
    return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
  })
  .forEach((file) => {
    const model = require(path.join(baseModelPath, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
