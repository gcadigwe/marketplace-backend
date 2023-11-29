import { DataTypes } from "sequelize";
import { db } from "../connection";
import { Category } from "./category";

export const NFT = db.define(
  "Nft",
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priceType: {
      type: DataTypes.ENUM("Fixed", "Auction"),
      values: ["Fixed", "Auction"],
    },
    price: {
      type: DataTypes.INTEGER,
    },
    minimumBid: {
      type: DataTypes.INTEGER,
    },
    maximumBid: {
      type: DataTypes.INTEGER,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    creator: {
      type: DataTypes.STRING,
    },
    display: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    mimeType: {
      type: DataTypes.STRING,
    },
    swapId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    modelName: "NFT",
    tableName: "nfts",
    // Other model options go here
  }
);

NFT.belongsTo(Category, {
  foreignKey: "category_id",
});

NFT.sync();
