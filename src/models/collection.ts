import { DataTypes } from "sequelize";
import { db } from "../connection";

export const Collection = db.define(
  "Collection",
  {
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contractAddress: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.INTEGER,
    },
    nfts: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    creator: {
      type: DataTypes.STRING,
    },
  },
  {
    modelName: "COLLECTION",
    tableName: "collections",
    // Other model options go here
  }
);

Collection.sync();
