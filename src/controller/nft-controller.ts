import { Request, Response } from "express";
import { NFT } from "../models/nft";
import {
  getUsersByToken,
  uploadImageToIpfs,
  uploadMetadataToIpfsAndMint,
} from "../utils/functions";
import { destroy, upload } from "../utils/uploadImage";
import pinataSDK from "@pinata/sdk";

export async function addAuctionToMarketplace(req: Request, res: Response) {
  try {
    const token: any = await getUsersByToken(req, res);

    if (token) {
      const {
        name,
        description,
        price_type,
        price,
        minimum_bid,
        maximum_bid,
        images,
        endTime,
        startTime,
        amount,
      } = req.body.auctionDetails;

      console.log(images);

      const completed = await uploadMetadataToIpfsAndMint(
        images,
        description,
        name,
        amount,
        maximum_bid,
        minimum_bid,
        endTime,
        startTime
      );

      console.log("completed", completed);

      if (completed) {
        res.status(200).json({ msg: "NFT created and listed", status: true });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "An error occurred", status: false });
  }
}

export async function createUniqueNFT({
  name,
  description,
  price_type,
  price,
  minimum_bid,
  maximum_bid,
  images,
  creator,
  mimeType,
  swapId,
}: any) {
  try {
    // const {
    //   name,
    //   description,
    //   price_type,
    //   price,
    //   minimum_bid,
    //   maximum_bid,
    //   images,
    //   creator,
    // } = req.body.createDetails;

    let nft = await NFT.create({
      name,
      description,
      priceType: price_type,
      price,
      minimumBid: minimum_bid ? minimum_bid : "0",
      maximumBid: maximum_bid ? maximum_bid : "0",
      images,
      creator: creator,
      mimeType: mimeType,
      swapId: swapId,
    });

    nft.save();

    // res.status(200).json({ msg: "nft created successfully" });
    return true;
  } catch (err) {
    console.log(err);
  }
}

export async function fetchNFTByUser(req: Request, res: Response) {
  try {
    const { address } = req.body;

    if (address) {
      const nfts: any = await NFT.findAll({
        where: { creator: address, display: true },
      });

      res.status(200).json({ data: nfts });
    } else {
      res.status(400).json({ msg: "incomplete data" });
    }
  } catch (err) {
    console.log(err);
  }
}

export async function createNFT(req: Request, res: Response) {
  try {
    let nft = await NFT.create({
      NftType: req.body.type,
      Title: req.body.title,
      category_id: 2,
    });

    nft.save();

    res.send("nft created");
  } catch (err: any) {
    res.status(400).send("an error occurred");
    console.log(err.detail);
  }
}

export async function fetchNFTById(req: Request, res: Response) {
  try {
    const { id } = req.body;

    if (id) {
      const nft = await NFT.findOne({ where: { id: id } });
      if (nft) {
        res.status(200).json({ data: nft });
      } else {
        res.status(404).json({ msg: "NFT not found" });
      }
    } else {
      res.status(400).json({ msg: "incomplete query data" });
    }
  } catch (err: any) {
    res.status(400).send({ msg: "an error occurred" });
    console.log(err.detail);
  }
}

export async function uploadImage(req: Request, res: Response) {
  try {
    const response = await upload(req.body.image);

    res.send(response);
  } catch (err: any) {
    res.status(400).json({ msg: "an error occurred" });
  }
}

export async function deleteImage(req: Request, res: Response) {
  try {
    const response = await destroy(req.body.url);

    res.send(response);
  } catch (err: any) {
    res.status(400).json({ msg: "an error occurred" });
  }
}

export async function fetchNfts(req: Request, res: Response) {
  try {
    const nfts = await NFT.findAll();

    res.status(200).json({ data: nfts });
  } catch (err) {
    res.status(400).json({ msg: "an error occurred" });
  }
}

export async function sendToIpfs(req: Request, res: Response) {
  try {
    const { id } = req.body;
    const pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_API_SECRET
    );

    if (id) {
      const nft: any = await NFT.findOne({ where: { id: id } });

      if (nft.created === false) {
        const hash: any = await uploadImageToIpfs(nft.images[0]);

        console.log("second hash", hash);
        //signature should be added to json metadata
        const nftMetadata = {
          decimals: 0,
          name: nft.name,
          description: nft.description,
          date: new Date(),
          tags: ["Digital"],
          artifactsUri: `ipfs://${hash.hash}`,
          displayUri: `ipfs://${hash.hash}`,
          thumbnailUri: `ipfs://${hash.hash}`,
          formats: [
            {
              uri: `ipfs://${hash.hash}`,
              mimeType: "image/jpeg",
            },
          ],
          minter: "tz1SyTN3Qwka1ogFydoFTnnZiPhyGkroVu6H",
          creators: ["tz1SyTN3Qwka1ogFydoFTnnZiPhyGkroVu6H"],
          contributors: [],
          publishers: ["Tezos"],
          isBooleanAmount: false,
          royalties: {
            decimals: 2,
            shares: { tz1SyTN3Qwka1ogFydoFTnnZiPhyGkroVu6H: 10 },
          },
        };

        pinata
          .pinJSONToIPFS(nftMetadata)
          .then(async (result) => {
            console.log(result);
            console.log("got to minting");
            return res.status(200).json({
              data: {
                minted: false,
                metadata: result.IpfsHash,
                id: nft.id,
                available: nft.available,
              },
            });
            // const hashBytes = Buffer.from(
            //   `ipfs://${result.IpfsHash}`,
            //   "utf-8"
            // ).toString("hex");
            // await createAndMintTokens(hashBytes);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return res
          .status(200)
          .json({ data: { minted: true, metadata: "", id: id } });
      }
    } else {
      res.status(400).json({ msg: "incomplete data" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "an error occurred" });
  }
}

export async function editNft(req: Request, res: Response) {
  try {
    const { id, price, minimum_bid, maximum_bid, price_type } =
      req.body.editDetails;

    console.log(req.body);

    if (id) {
      let nft: any = await NFT.findOne({ where: { id: id } });
      const token: any = await getUsersByToken(req, res);

      console.log(token.payload.user_id);

      if (nft.creator === token.payload.user_id) {
        nft["price"] = price ? price : 0;
        nft["minimum_bid"] = minimum_bid ? minimum_bid : 0;
        nft["maximum_bid"] = maximum_bid ? maximum_bid : 0;
        nft["price_type"] = price_type;
        nft.save();
        return res.status(200).json({ msg: "Successful" });
      } else {
        res.status(401).json({ msg: "Unauthorized" });
      }
    } else {
      res.status(400).json({ msg: "incomplete data" });
    }
  } catch (err) {
    console.log(err);
  }
}

export async function removeNft(req: Request, res: Response) {
  try {
    const { id } = req.body;

    if (id) {
      let nft: any = await NFT.findOne({ where: { id: id } });
      const token: any = getUsersByToken(req, res);

      if (nft.creator === token.payload.user_id) {
        nft["display"] = false;
        nft.save();
      } else {
        res.status(401).json({ msg: "Unauthorized" });
      }
    } else {
      res.status(400).json({ msg: "incomplete data" });
    }
  } catch (err) {
    console.log(err);
  }
}

export async function updateNftAfterSale(req: Request, res: Response) {
  try {
    const { id } = req.body;

    if (id) {
      let nft: any = await NFT.findOne({ where: { id: id } });

      if (nft) {
        nft["display"] = false;

        await nft.save();

        res.status(200).json({ data: { updated: true } });
      } else {
        res.status(404).json({ msg: "NFT not found" });
      }
    } else {
      res.status(400).json({ msg: "incomplete data" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "an error occurred" });
  }
}
