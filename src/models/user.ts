import { DataTypes } from "sequelize";
import { db } from "../connection";

export const User = db.define(
  "User",
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    walletAddress: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    nonce: {
      type: DataTypes.INTEGER,
    },
    whitelisted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    ownedNfts: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
  },
  {
    tableName: "users",
    modelName: "User",
    // Other model options go here
  }
);

User.sync();
