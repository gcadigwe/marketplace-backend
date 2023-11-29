import express from "express";

const router = express.Router();

import { createCategory } from "./controller/category-controller";
import {
  addAuctionToMarketplace,
  createNFT,
  createUniqueNFT,
  deleteImage,
  editNft,
  fetchNFTById,
  fetchNFTByUser,
  fetchNfts,
  removeNft,
  sendToIpfs,
  updateNftAfterSale,
  uploadImage,
} from "./controller/nft-controller";
import { loginWallet, registerUser } from "./controller/user-controller";
// import { getSwapById, getSwaps } from "./controller/swap-controller";
import {
  acceptAuctionOffer,
  editAuctionBid,
  getAuctionById,
  getAuctions,
} from "./controller/auction-controller";
import {
  createCollection,
  getCollection,
  getCollections,
  mintNFTFromCollection,
} from "./controller/collection-controller";
import { ListVideoNFT } from "./listing/list";
import multer = require("multer");
import { fetchTransactions } from "./utils/transactions";

router.get("/", (req, res) => {
  return res.send("Hello API server talking");
});

const upload: any = multer({ dest: __dirname + "/uploads/" });

//user
router.post("/register", registerUser);
router.post("/login-wallet", loginWallet);

//nft category
// router.post("/create-nft-category", createCategory);
// router.post("/create-unique-nft", createUniqueNFT);

//video-nft
// router.post("/list-video-nft", upload.single("video"), ListVideoNFT);

//nft
// router.post("/create-nft", createNFT);
router.post("/fetch-nft-by-id", fetchNFTById);
router.get("/fetch-nfts", fetchNfts);
// router.post("/send-image-ipfs", sendToIpfs);
// router.post("/update-sold", updateNftAfterSale);
router.post("/remove-nft", removeNft);

// todo: add editor privilege
router.post("/update-nft", updateNftAfterSale);

//auction
router.post("/list-auction", addAuctionToMarketplace);
router.get("/get-auction", getAuctionById);
router.get("/get-auctions", getAuctions);
router.post("/accept-offer", acceptAuctionOffer);
router.post("/edit-aution", editAuctionBid);

//collection
router.post("/create-collection", createCollection);
router.post("/mint-collection", mintNFTFromCollection);
router.get("/collection", getCollection);
router.get("/collections", getCollections);

//upload image
router.post("/upload-image", uploadImage);

//delete image
router.post("/delete-image", deleteImage);

//fetch transactions
// router.get("/transactions", fetchTransactions);

export default router;
