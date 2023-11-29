import axios from "axios";
import pinataSDK from "@pinata/sdk";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

export const generateMetadata = (
  name: string,
  description: string,
  hash: any,
  minter: string,
  id?: number,
  thumbnailHash?: string,
  mimeType?: string,
  wearable?: boolean,
  feature?: string,
  featureValue?: string
) => {
  const admin = process.env.ADMIN_WALLET;
  //signature should be added to json metadata
  const nftMetadata = {
    decimals: 0,
    name: `${name} #${id}`,
    description: description,
    date: new Date(),
    tags: ["Digital"],
    artifactsUri: `ipfs://${hash}`,
    displayUri: `ipfs://${hash}`,
    thumbnailUri: `ipfs://${thumbnailHash}`,
    formats: [
      {
        uri: `ipfs://${hash}`,
        mimeType: mimeType,
      },
    ],
    attributes: [
      {
        feature: "wearable",
        value: wearable,
      },
      wearable && {
        feature: feature,
        value: featureValue,
      },
    ],

    minter: minter,
    creators: [minter, admin],
    contributors: [],
    publishers: ["Tezos"],
    isBooleanAmount: false,
    royalties: {
      decimals: 2,
      shares: { admin: 10 },
    },
  };

  return nftMetadata;
};

export const getNextTokenID = async () => {
  let total_supply_map = await axios.get(
    `${process.env.TZKT_API}bigmaps?id=${process.env.TOKENSUPPLYBIGMAP}&contract=${process.env.NFT_CONTRACT}&ptr=${process.env.TOKENSUPPLYBIGMAP}`
  );

  const totalKeys = total_supply_map.data.filter(
    (item: any) => item.ptr == process.env.TOKENSUPPLYBIGMAP
  );

  return totalKeys[0].totalKeys + 1;
};

export const getNextSwapId = async () => {
  try {
    const Tezos = new TezosToolkit(process.env.RPC_URL as string);

    Tezos.setProvider({
      signer: new InMemorySigner(process.env.PRIVATE_KEY as string),
    });

    const marketplaceContract: any = await (
      await Tezos.contract.at(
        process.env.MARKETPLACE_CONTRACT_ADDRESS as string
      )
    ).storage();

    return marketplaceContract.counter;
  } catch (err) {
    console.log(err);
  }
};

export const buildHashBytes = async (
  name: string,
  description: string,
  hash: any,
  minter: string,
  id?: number,
  thumbnailHash?: string,
  mimeType?: string,
  wearable?: boolean,
  feature?: string,
  featureValue?: string
) => {
  const pinata = new pinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_API_SECRET
  );

  const metadata = generateMetadata(
    name,
    description,
    hash,
    minter,
    id,
    thumbnailHash,
    mimeType,
    wearable,
    feature,
    featureValue
  );
  console.log(metadata);
  const hashBytes = pinata
    .pinJSONToIPFS(metadata)
    .then(async (result) => {
      console.log(result);
      console.log("got to minting");

      const hashBytes = Buffer.from(
        `ipfs://${result.IpfsHash}`,
        "utf-8"
      ).toString("hex");

      return hashBytes;
    })
    .catch((err) => {
      console.log(err);
    });

  return hashBytes;
};

export const getTokenInfoByID = async (contract: string, tokenId: number) => {
  try {
    const { data } = await axios.get(
      `${process.env.TZKT_API}tokens?contract=${contract}&tokenId=${tokenId}`
    );

    return data[0].metadata;
  } catch (err) {
    console.log(err);
  }
};
