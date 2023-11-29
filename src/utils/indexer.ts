import axios from "axios";
import { Auction } from "../models/auction";
import { Updates } from "../models/updates";

export const index = async () => {
  try {
    const marketplacebigmapsFetch = await axios.get(
      `${process.env.TZKT_API}contracts/${process.env.MARKETPLACE_CONTRACT_ADDRESS}/bigmaps`
    );

    const auctionMap = marketplacebigmapsFetch.data.filter(
      (item: any) => item.path == "auctions"
    );

    const auctionUpdates = await axios.get(
      `${process.env.TZKT_API}bigmaps/updates?contract=${process.env.MARKETPLACE_CONTRACT_ADDRESS}&path=auctions`
    );

    const swapMap = marketplacebigmapsFetch.data.filter(
      (item: any) => item.path == "swaps"
    );

    let auctionUpdate: any = await Updates.findOne({
      where: { transactionType: "auction" },
    });

    console.log(auctionUpdate?.dataValues.updateCount);

    const auctionsToLoop = auctionUpdates.data.slice(
      auctionUpdate?.dataValues.updateCount
    );

    if (auctionsToLoop.length !== 0) {
      for (let i = 0; i < auctionsToLoop.length; i++) {
        if (auctionsToLoop[i].action !== "allocate") {
          if (auctionsToLoop[i].action === "add_key") {
            let values = auctionsToLoop[i].content.value;

            const metadata = await getTokenMetadata(values.objkt_id);

            let auction = Auction.create({
              id: parseFloat(auctionsToLoop[i].content.key) + 1,
              tokenId: values.objkt_id,
              contract: process.env.MARKETPLACE_CONTRACT_ADDRESS,
              minimumBid: values.objkt_min_price,
              maximumBid: values.objkt_max_price,
              amount: values.objkt_amount,
              issuer: values.issuer,
              active: values.active,
              startTime: values.start_time,
              endTime: values.end_time,
              topBid: values.top_bid,
              topBidder: values.top_bidder,
              tokenMetadata: metadata,
              fa12: values.fa12,
            });

            (await auction).save();

            auctionUpdate["updateCount"] = auctionUpdates.data.length;
            auctionUpdate.save();

            // console.log("auction", auctions.data[0].value);
          } else if (auctionsToLoop[i].action === "update_key") {
            let auction: any = await Auction.findOne({
              where: { id: parseFloat(auctionsToLoop[i].content.key) + 1 },
            });

            let values = auctionsToLoop[i].content.value;

            console.log(auction);

            auction["active"] = values.active;
            auction["minimumBid"] = values.objkt_min_price;
            auction["maximumBid"] = values.objkt_max_price;
            auction["topBid"] = values.top_bid;

            auction.save();

            auctionUpdate["updateCount"] = auctionUpdates.data.length;
            auctionUpdate.save();
          }
        }
      }
    }

    console.log("nothing");
  } catch (err) {
    console.log(err);
  }
};

const getTokenMetadata = async (id: string) => {
  try {
    const nftbigmapsFetch = await axios.get(
      `${process.env.TZKT_API}contracts/${process.env.NFT_CONTRACT}/bigmaps`
    );

    const metadataMap = nftbigmapsFetch.data.filter(
      (item: any) => item.path == "assets.token_metadata"
    );

    const token_metadata = await axios.get(
      `${process.env.TZKT_API}bigmaps/${metadataMap[0].ptr}/keys/${id}/updates`
    );

    const byteArray = Buffer.from(
      token_metadata.data[0].value.token_info[""],
      "hex"
    );
    const result = byteArray.toString("utf8");

    return result;
  } catch (err) {
    console.log(err);
  }
};

export const createAuctionUpdatesModel = async () => {
  try {
    const update = await Updates.findOne({ where: { id: 2 } });
    if (update == null) {
      const auctionUpdate = await Updates.create({
        id: 2,
        transactionType: "auction",
        updateCount: 0,
      });

      auctionUpdate.save();
    }
  } catch (err) {
    console.log(err);
  }
};

export const createSwapUpdatesModal = async () => {
  try {
    const update = await Updates.findOne({ where: { id: 1 } });
    if (update == null) {
      const auctionUpdate = await Updates.create({
        id: 1,
        transactionType: "swap",
        updateCount: 0,
      });

      auctionUpdate.save();
    }
  } catch (err) {
    console.log(err);
  }
};
