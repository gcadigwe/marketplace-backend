import express from "express";
import { authenticate } from "./connection";
require("dotenv").config();
import router from "./routes";
import cors from "cors";
import nodeCron from "node-cron";
import {
  createAuctionUpdatesModel,
  createSwapUpdatesModal,
  index,
} from "./utils/indexer";
import multer from "multer";

import { ListVideoNFT } from "./listing/list";

async function run() {
  const app = express();

  const upload: any = multer({ dest: __dirname + "/uploads/" });

  const PORT = process.env.PORT || 2000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.get("/", function (req, res) {
    return res.send("Hello! The API is working");
  });

  app.use(
    cors({
      origin: "*",
    })
  );

  app.use("/api", router);

  app.post("/api/list-video-nft", upload.any("video"), ListVideoNFT);

  // nodeCron.schedule("*/10 * * * * *", index);

  // getSwapLength();

  app.listen(PORT, async () => {
    console.log("Server starting on port : " + PORT);
    await authenticate();
    // await createSwapUpdatesModal();
    // await createAuctionUpdatesModel();
  });
}

run();
