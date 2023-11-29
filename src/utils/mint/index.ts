import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap } from "@taquito/taquito";

export const mintNFT = async (
  tokenId: number,
  amount: number,
  tokenBytes: any
) => {
  try {
    const tezos = new TezosToolkit(process.env.RPC_URL as string);

    tezos.setProvider({
      signer: new InMemorySigner(process.env.PRIVATE_KEY as string),
    });

    let nft_contract = await tezos.contract.at(
      process.env.NFT_CONTRACT as string
    );

    let methods: any = (await nft_contract).methodsObject;

    let batch = tezos.wallet.batch([]);

    const tokenInfoMap = new MichelsonMap({
      prim: "map",
      args: [{ prim: "string" }, { prim: "bytes" }],
    });

    tokenInfoMap.set("", tokenBytes);

    batch
      .withContractCall(
        nft_contract.methods.create_token(tokenId, tokenInfoMap) as any
      )
      .withContractCall(
        methods.mint_tokens([
          {
            owner: process.env.ADMIN_WALLET,
            token_id: tokenId,
            amount: amount,
          },
        ])
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
};
