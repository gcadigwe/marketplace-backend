import { DataTypes } from "sequelize";
import { db } from "../connection";

export const Operation = db.define(
  "Operation",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    redeemer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    operationHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    modelName: "OPERATION",
    tableName: "operations",
    // Other model options go here
  }
);

Operation.sync();
