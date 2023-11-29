import { Request, Response } from "express";
import { Collection } from "../models/collection";
import {
  deployNFTContract,
  fetchOperation,
  getUsersByToken,
  mintNFT,
} from "../utils/functions";
import axios from "axios";
// import { createOperation } from "./operation-controller";

export async function createCollection(req: Request, res: Response) {
  try {
    const { name, description, images, price } = req.body.createDetails;

    if (!name || !description || !images || !price) {
      res.status(400).json({ msg: "Incomplete Data" });
    } else {
      const contractAddress = await deployNFTContract();
      const token: any = await getUsersByToken(req, res);

      console.log("contract created");

      if (contractAddress) {
        let collection = await Collection.create({
          name,
          description,
          price,
          nfts: images,
          contractAddress,
          creator: token.payload.user_id,
        });

        collection.save();

        res.status(200).json({ msg: "Collection Created Successfully" });
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export async function mintNFTFromCollection(req: Request, res: Response) {
  try {
    const { contractAddress, imageUrl, operationHash, tokenContract } =
      req.body;
    if (!contractAddress || !imageUrl || !operationHash || !tokenContract) {
      res.status(400).json({ msg: "Incomplete Data" });
    } else {
      const collection = await Collection.findOne({
        where: { contractAddress: contractAddress },
      });
      const token: any = await getUsersByToken(req, res);

      if (collection) {
        const image = collection?.dataValues.nfts.filter(
          (nft: string) => nft === imageUrl
        );

        const id = collection.dataValues.nfts.indexOf(imageUrl);

        console.log("id", id);

        const validateId = id === -1 ? undefined : id + 1;

        if (validateId) {
          //check if nft has already been minted
          const { data } = await axios.get(
            `${process.env.TZKT_API}tokens?contract=${collection.dataValues.contractAddress}&tokenId=${validateId}`
          );

          if (data.length === 0) {
            const operation = await fetchOperation(
              operationHash,
              tokenContract
            );

            if (
              operation.parameter.value.to === collection.dataValues.creator &&
              parseFloat(operation.parameter.value.value) >=
                collection.dataValues.price
            ) {
              const completed = await mintNFT(
                collection.dataValues.name,
                collection.dataValues.description,
                token.payload.user_id,
                collection.dataValues.contractAddress,
                image[0],
                validateId
              );

              if (completed) {
                // await createOperation(token.payload.user_id, operationHash);
                res.status(200).json({ msg: "Minting Successful" });
              } else {
                res.status(400).json({ msg: "An Error Occurred" });
              }
            } else {
              res
                .status(400)
                .json({ msg: "Transaction Receipt not confirmed" });
            }
          } else {
            res.status(400).json({ msg: "Token Already Minted" });
          }
        } else {
          res.status(404).json({ msg: "NFT Not Found" });
        }
      } else {
        res.status(404).json({ msg: "Collection Not Found" });
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export async function getCollections(req: Request, res: Response) {
  try {
    const collections = await Collection.findAll();

    res.send(collections);
  } catch (err) {
    console.log(err);
  }
}

export async function getCollection(req: Request, res: Response) {
  try {
    const { id } = req.query;
    if (id) {
      const collection = await Collection.findOne({
        where: { contractAddress: id },
      });

      res.status(200).send(collection);
    } else {
      res.status(400).json({ msg: "Incomplete Data" });
    }
  } catch (err) {
    console.log(err);
  }
}
