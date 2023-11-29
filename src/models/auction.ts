import { DataTypes } from "sequelize";
import { db } from "../connection";

export const Auction = db.define(
  "Auction",
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
    minimumBid: {
      type: DataTypes.INTEGER,
    },
    maximumBid: {
      type: DataTypes.INTEGER,
    },
    amount: {
      type: DataTypes.STRING,
    },
    issuer: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
    },
    startTime: {
      type: DataTypes.DATE,
    },
    endTime: {
      type: DataTypes.DATE,
    },
    topBid: {
      type: DataTypes.STRING,
    },
    topBidder: {
      type: DataTypes.STRING,
    },
    tokenMetadata: {
      type: DataTypes.STRING,
    },
    fa12: {
      type: DataTypes.STRING,
    },
  },
  {
    modelName: "AUCTION",
    tableName: "auctions",
    // Other model options go here
  }
);

Auction.sync();
