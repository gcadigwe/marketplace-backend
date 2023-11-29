import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import pinataSDK from "@pinata/sdk";
import axios from "axios";
import { TezosToolkit, MichelsonMap } from "@taquito/taquito";
import { InMemorySigner, importKey } from "@taquito/signer";
// import { SwapLength } from "../models/swaplength";

// import { updateLength } from "../controller/swaplength-controller";
import { Swap } from "../models/swap";
import { Request, Response } from "express";
import { code } from "./nftcontract";
import { generateMetadata } from ".";

export const validateEmail = (input: string) => {
  var validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (input.match(validRegex)) {
    return true;
  } else {
    return false;
  }
};

export const createToken = (user: any, wallet: boolean) => {
  if (wallet) {
    return jwt.sign(
      { key: user.key, user_id: user.walletAddress },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h", // TODO: change for the correct time
      }
    );
  } else {
    return jwt.sign(
      { key: user.key, user_id: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h", // TODO: change for the correct time
      }
    );
  }
};

export function generateNonce() {
  return Math.floor(Math.random() * 1000000);
}

export async function uploadImageToIpfs(imageUrl: string) {
  const pinata = new pinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_API_SECRET
  );

  const response = await axios.get(imageUrl, {
    responseType: "stream",
  });

  const Path = path.resolve(__dirname, "files", "file-1.jpg");

  const writer = fs.createWriteStream(Path);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", async () => {
      const readableStreamForFile = fs.createReadStream(
        __dirname + "/files/file-1.jpg"
      );

      return (
        pinata
          .pinFileToIPFS(readableStreamForFile, {
            pinataMetadata: {
              name: "Image-1",
            },
          })
          // .pinFromURL(imageUrl)
          .then((result: { IpfsHash: string; Timestamp: string }) => {
            console.log(result);
            fs.unlink(__dirname + "/files/file-1.jpg", (err) => {
              if (err) {
                console.log(err);
              }
            });
            return resolve({
              hash: result.IpfsHash,
              timestamp: result.Timestamp,
            });
          })
          .catch((err) => {
            console.log(err);
          })
      );
    });
    writer.on("error", reject);
  });
}

export async function acceptOffer(key: string) {
  try {
    const tezos = new TezosToolkit(process.env.RPC_URL as string);

    tezos.setProvider({
      signer: new InMemorySigner(process.env.PRIVATE_KEY as string),
    });

    let marketplaceContract = await tezos.contract.at(
      process.env.MARKETPLACE_CONTRACT_ADDRESS as string
    );

    let batch = tezos.wallet.batch([]);

    batch.withContractCall(
      marketplaceContract.methods.accept_auction_offer(
        parseFloat(key) - 1
      ) as any
    );

    const completed = await (
      await (await batch.send()).confirmation()
    ).completed;

    if (completed) {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function editBid(
  id: string,
  minimumBid: string,
  maximumBid: string
) {
  try {
    const tezos = new TezosToolkit(process.env.RPC_URL as string);

    tezos.setProvider({
      signer: new InMemorySigner(process.env.PRIVATE_KEY as string),
    });

    let marketplaceContract = await tezos.contract.at(
      process.env.MARKETPLACE_CONTRACT_ADDRESS as string
    );

    let batch = tezos.wallet.batch([]);

    batch.withContractCall(
      marketplaceContract.methods.edit_auction_bids(
        maximumBid,
        minimumBid,
        id
      ) as any
    );

    const completed = await (
      await (await batch.send()).confirmation()
    ).completed;

    if (completed) {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function createAndMintTokens(
  tokenBytes: string,
  amount: number,
  maxPrice: string,
  minPrice: string,
  endTime: string,
  startTime: string
) {
  try {
    const tezos = new TezosToolkit(process.env.RPC_URL as string);

    tezos.setProvider({
      signer: new InMemorySigner(process.env.PRIVATE_KEY as string),
    });

    let nft_contract = await tezos.contract.at(
      process.env.NFT_CONTRACT as string
    );

    let marketplaceContract = await tezos.contract.at(
      process.env.MARKETPLACE_CONTRACT_ADDRESS as string
    );

    let methods: any = (await nft_contract).methodsObject;

    let batch = tezos.wallet.batch([]);

    let total_supply_map = await axios.get(
      `${process.env.TZKT_API}bigmaps?id=${process.env.TOKENSUPPLYBIGMAP}&contract=${process.env.NFT_CONTRACT}&ptr=${process.env.TOKENSUPPLYBIGMAP}`
    );

    const tokenInfoMap = new MichelsonMap({
      prim: "map",
      args: [{ prim: "string" }, { prim: "bytes" }],
    });

    tokenInfoMap.set("", tokenBytes);

    const totalKeys = total_supply_map.data.filter(
      (item: any) => item.ptr == process.env.TOKENSUPPLYBIGMAP
    );

    console.log("tokenid", totalKeys[0].totalKeys + 1);

    batch
      .withContractCall(
        nft_contract.methods.create_token(
          totalKeys[0].totalKeys + 1,
          tokenInfoMap
        ) as any
      )
      .withContractCall(
        methods.mint_tokens([
          {
            owner: process.env.ADMIN_WALLET,
            token_id: totalKeys[0].totalKeys + 1,
            amount: amount,
          },
        ])
      )
      .withContractCall(
        methods.update_operators([
          {
            add_operator: {
              operator: process.env.MARKETPLACE_CONTRACT_ADDRESS as string,
              token_id: totalKeys[0].totalKeys + 1,
              owner: process.env.ADMIN_WALLET,
            },
          },
        ])
      )
      .withContractCall(
        marketplaceContract.methods.add_to_marketplace_auction(
          endTime,
          "KT1WvFhGYgsdYCAkRnJWYtCLNa2jvZGXDJh8",
          process.env.ADMIN_WALLET,
          amount,
          totalKeys[0].totalKeys + 1,
          maxPrice,
          minPrice,
          0,
          startTime
        ) as any
      );

    const completed = await (
      await (await batch.send()).confirmation()
    ).completed;

    if (completed) {
      return true;
    }
    // console.log(confirmation);
  } catch (err) {
    console.log(err);
  }
}

// export const getSwapLength = async () => {
//   try {
//     const swaps: any = await Swap.findAll();
//     const lengthonBlockchain = await axios.get(
//       process.env.TZKT_API + `bigmaps/updates?bigmap=${process.env.BIGMAPPTR}`
//     );

//     const filterBlockchaindata = lengthonBlockchain.data.filter(
//       (item: any) => item.action !== "allocate"
//     );

//     if (!swaps && filterBlockchaindata.length > 0) {
//       for (let i = 0; i < filterBlockchaindata.length; i++) {
//         await addSwap(filterBlockchaindata[i]);
//       }
//       // return updateLength(lengthonBlockchain.data.length);
//     } else if (swaps && filterBlockchaindata.length > 0) {
//       console.log("swaps length", swaps.length);
//       if (filterBlockchaindata.length > swaps.length) {
//         for (let i = 0; i < filterBlockchaindata.length; i++) {
//           await addSwap(filterBlockchaindata[i]);
//         }
//         // return updateLength(lengthonBlockchain.data.length);
//       }
//     }
//     // console.log(length?.length);
//   } catch (err) {
//     console.log(err);
//   }
// };

export async function getUsersByToken(req: Request, res: Response) {
  try {
    if (
      !req.headers.authorization ||
      req.headers.authorization.split(" ")[0] !== "Bearer"
    ) {
      res.status(401).json({ msg: "Incomplete data" });
    } else {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.decode(token, {
        complete: true,
      });

      // console.log(decodedToken);
      return decodedToken;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function mintNFT(
  name: string,
  description: string,
  minter: string,
  contractAddress: string,
  image: string,
  id: number
) {
  try {
    const pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_API_SECRET
    );
    const Tezos = new TezosToolkit(process.env.RPC_URL as string);

    Tezos.setProvider({
      signer: new InMemorySigner(process.env.PRIVATE_KEY as string),
    });

    console.log("before hash");

    const hash: any = await uploadImageToIpfs(image);

    console.log("hash", hash);

    const metadata = generateMetadata(name, description, hash, minter, id);

    console.log("metadata", metadata);

    const nft_contract = await Tezos.contract.at(contractAddress);

    const completed = pinata
      .pinJSONToIPFS(metadata)
      .then(async (result) => {
        console.log(result);
        console.log("got to minting");

        const hashBytes = Buffer.from(
          `ipfs://${result.IpfsHash}`,
          "utf-8"
        ).toString("hex");

        const tokenInfoMap = new MichelsonMap({
          prim: "map",
          args: [{ prim: "string" }, { prim: "bytes" }],
        });

        tokenInfoMap.set("", hashBytes);

        let batch = Tezos.wallet.batch([]);

        batch
          .withContractCall(
            nft_contract.methods.create_token(id, tokenInfoMap) as any
          )
          .withContractCall(
            nft_contract.methods.mint_tokens([
              {
                owner: minter,
                token_id: id,
                amount: 1,
              },
            ]) as any
          );

        const completed = await (
          await (await batch.send()).confirmation()
        ).completed;

        return completed;
      })
      .catch((err) => {
        console.log(err);
      });

    return completed;
  } catch (err) {
    console.log(err);
  }
}

export async function uploadMetadataToIpfsAndMint(
  image: any,
  description: any,
  name: any,
  fixed: boolean,
  amount?: number,
  maxPrice?: string,
  minPrice?: string,
  endTime?: string,
  startTime?: string
) {
  try {
    const pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_API_SECRET
    );

    const hash: any = await uploadImageToIpfs(image[0]);

    console.log("second hash", hash);
    //signature should be added to json metadata
    const nftMetadata = {
      decimals: 0,
      name: name,
      description: description,
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

    const completed = pinata
      .pinJSONToIPFS(nftMetadata)
      .then(async (result) => {
        console.log(result);
        console.log("got to minting");

        const hashBytes = Buffer.from(
          `ipfs://${result.IpfsHash}`,
          "utf-8"
        ).toString("hex");
        const completed = await createAndMintTokens(
          hashBytes,
          amount as number,
          maxPrice as string,
          minPrice as string,
          endTime as string,
          startTime as string
        );

        return completed;
      })
      .catch((err) => {
        console.log(err);
      });

    return completed;
  } catch (err) {
    console.log(err);
  }
}

export async function deployNFTContract() {
  try {
    const tezos = new TezosToolkit(process.env.RPC_URL as string);

    tezos.setProvider({
      signer: new InMemorySigner(process.env.PRIVATE_KEY as string),
    });

    const op = await tezos.contract.originate({
      code: code,
      init: {
        prim: "Pair",
        args: [
          {
            prim: "Pair",
            args: [
              {
                prim: "Pair",
                args: [
                  {
                    prim: "Pair",
                    args: [
                      {
                        string: process.env.ADMIN_WALLET,
                      },
                      {
                        prim: "False",
                      },
                    ],
                  },
                  {
                    prim: "None",
                  },
                ],
              },
              {
                prim: "Pair",
                args: [
                  {
                    prim: "Pair",
                    args: [[], []],
                  },
                  {
                    prim: "Pair",
                    args: [[], []],
                  },
                ],
              },
            ],
          },
          [],
        ],
      },
    });

    return op.contractAddress;
  } catch (err) {
    console.log(err);
  }
}

export async function fetchOperation(
  operationHash: string,
  tokenContract: string
) {
  try {
    if (operationHash) {
      let operation = await axios.get(
        `${process.env.TZKT_API}operations/${operationHash}`
      );

      let transferOperation = operation.data.filter(
        (op: any) =>
          op.target.address === tokenContract &&
          op.parameter.entrypoint === "transfer"
      );

      console.log(transferOperation);

      return transferOperation[0];
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
  }
}
