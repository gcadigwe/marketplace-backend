import { Sequelize, DataTypes } from "sequelize";
import { db } from "../connection";

export const Updates = db.define(
  "Updates",
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    transactionType: {
      type: DataTypes.STRING,
    },
    updateCount: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "updates",
    modelName: "Updates",
    // Other model options go here
  }
);

Updates.sync();
