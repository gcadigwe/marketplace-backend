import { Sequelize, DataTypes } from "sequelize";
import { db } from "../connection";
import { NFT } from "./nft";

export const Category = db.define(
  "Category",
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "categories",
    modelName: "Category",
    // Other model options go here
  }
);

Category.sync();
