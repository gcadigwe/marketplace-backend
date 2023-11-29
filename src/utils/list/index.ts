import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import axios from "axios";

export const listNFT = async (
  priceType: string,
  price: string,
  tokenId: number,
  amount: number,
  minimum_bid: string,
  maximum_bid: string,
  endTime: string,
  startTime: string
) => {
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

    if (priceType === "Fixed") {
      batch

        .withContractCall(
          methods.update_operators([
            {
              add_operator: {
                operator: process.env.MARKETPLACE_CONTRACT_ADDRESS as string,
                token_id: tokenId,
                owner: process.env.ADMIN_WALLET,
              },
            },
          ])
        )
        .withContractCall(
          marketplaceContract.methods.add_to_marketplace(
            "KT1WvFhGYgsdYCAkRnJWYtCLNa2jvZGXDJh8",
            amount,
            tokenId,
            price,
            10
          ) as any
        );

      const completed = await (
        await (await batch.send()).confirmation()
      ).completed;

      console.log("listing", completed);

      if (completed) {
        return true;
      }
    } else {
      batch

        .withContractCall(
          methods.update_operators([
            {
              add_operator: {
                operator: process.env.MARKETPLACE_CONTRACT_ADDRESS as string,
                token_id: tokenId,
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
            tokenId,
            maximum_bid,
            minimum_bid,
            0,
            startTime
          ) as any
        );

      const completed = await (
        await (await batch.send()).confirmation()
      ).completed;

      console.log("listing", completed);

      if (completed) {
        return true;
      }
    }
  } catch (err) {
    console.log(err);
  }
};
