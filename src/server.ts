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
import fs from "fs";
import https from "https";

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

  try {
    const privateKey = fs.readFileSync(
      "/etc/letsencrypt/live/prod.alltokenfootball.com/privkey.pem",
      "utf8"
    );
    const certificate = fs.readFileSync(
      "/etc/letsencrypt/live/prod.alltokenfootball.com/cert.pem",
      "utf8"
    );
    const ca = fs.readFileSync(
      "/etc/letsencrypt/live/prod.alltokenfootball.com/chain.pem",
      "utf8"
    );
    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca,
    };

    const server = https.createServer(credentials, app);
    server.listen(PORT, async () => {
      console.log("Https Server starting on port : " + PORT);
      //await db.sequelize.sync({force: true});
      await authenticate();
    });
  } catch (error) {
    console.log("got error", error);
    app.listen({ port: PORT }, async () => {
      console.log("error got, Server up on http://localhost:" + PORT);
      //await db.sequelize.sync({force: true});
      //process.exit(1);
      await authenticate();
      console.log("Database Authenticate!");
      // await db.sequelize.sync({force: true});
      // console.log("Database Syncronized!");
      // console.log(
      //   "Hello! The API is at " + process.env.ORIGIN + ":" + PORT + "/api"
      // );
    });
  }

  // app.listen(PORT, async () => {
  //   console.log("Server starting on port : " + PORT);
  //   await authenticate();
  //   // await createSwapUpdatesModal();
  //   // await createAuctionUpdatesModel();
  // });
}

run();
