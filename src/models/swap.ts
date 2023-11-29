import { DataTypes } from "sequelize";
import { db } from "../connection";

export const Swap = db.define(
  "Swap",
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    tokenId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contract: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minimumBid: {
      type: DataTypes.INTEGER,
    },
    maximumBid: {
      type: DataTypes.INTEGER,
    },
    amount: {
      type: DataTypes.STRING,
    },
  },
  {
    modelName: "SWAP",
    tableName: "swaps",
    // Other model options go here
  }
);

Swap.sync();
