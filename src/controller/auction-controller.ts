import { Auction } from "../models/auction";
import { Request, Response } from "express";
import { getUsersByToken, acceptOffer, editBid } from "../utils/functions";

export const getAuctionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (id) {
      const auction = await Auction.findOne({ where: { id: id } });
      if (auction) {
        res.status(200).json(auction);
      } else {
        res.status(404).json({ msg: "Auction not found" });
      }
    } else {
      res.status(400).json({ msg: "Incomplete data" });
    }
  } catch (err) {
    console.log(err);
  }
};

export const getAuctions = async (req: Request, res: Response) => {
  try {
    const auctions = await Auction.findAll();

    res.status(200).json(auctions);
  } catch (err) {
    console.log(err);
  }
};

export const acceptAuctionOffer = async (req: Request, res: Response) => {
  try {
    const token: any = await getUsersByToken(req, res);
    const { id } = req.body;

    console.log(token);

    if (token) {
      const auction = await Auction.findOne({ where: { id: id } });

      if (auction?.dataValues.issuer == token.payload.user_id) {
        const completed = await acceptOffer(id);

        if (completed) {
          res.status(200).json({ msg: "Transaction Sucessful" });
        } else {
          res.status(400).json({ msg: "An error occurred" });
        }
      } else {
        res.status(401).json({ msg: "UNAUTHORIZED" });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const editAuctionBid = async (req: Request, res: Response) => {
  try {
    const token: any = await getUsersByToken(req, res);
    const { id, maximumBid, minimumBid } = req.body;

    console.log(token);

    if (token) {
      const auction = await Auction.findOne({ where: { id: id } });

      if (auction?.dataValues.issuer == token.payload.user_id) {
        const completed = await editBid(id, minimumBid, maximumBid);

        if (completed) {
          res.status(200).json({ msg: "Transaction Sucessful" });
        } else {
          res.status(400).json({ msg: "An error occurred" });
        }
      } else {
        res.status(401).json({ msg: "UNAUTHORIZED" });
      }
    }
  } catch (err) {
    console.log(err);
  }
};
