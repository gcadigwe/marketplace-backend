import { Request, Response } from "express";
import { getTokenInfoByID } from "..";
import { db } from "../../connection";

export const fetchTransactions = async (req: Request, res: Response) => {
  try {
    const [results, metadata]: any = await db.query(
      "SELECT * FROM indexer.fixed_transaction"
    );

    let transactions = [];

    for (let i = 0; i < results.length; i++) {
      console.log(results[i].token_id);
      let transactionInfo: any = {};
      const metadata = await getTokenInfoByID(
        process.env.NFT_CONTRACT as string,
        results[i].token_id
      );

      transactionInfo["metadata"] = metadata;
      transactionInfo["price"] = results[i].price;
      transactionInfo["id"] = results[i].id;
      transactionInfo["type"] = "Fixed";
      transactionInfo["tokenId"] = results[i].token_id;

      transactions.push(transactionInfo);
    }

    res.status(200).send(transactions);
  } catch (err) {
    console.log(err);
  }
};
