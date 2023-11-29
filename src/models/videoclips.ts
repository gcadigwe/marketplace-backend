import { Sequelize, DataTypes } from "sequelize";
import { db } from "../connection";

export const VideoClips = db.define(
  "VideoClips",
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    videos: {
      type: DataTypes.ARRAY,
    },
    NftId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    // Other model options go here
  }
);
