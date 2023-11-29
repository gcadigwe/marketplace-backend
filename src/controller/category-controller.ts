import { Request, Response } from "express";
import { Category } from "../models/category";
import { NFT } from "../models/nft";

export async function createCategory(req: Request, res: Response) {
  try {
    let category = await Category.create({
      name: req.body.name,
    });

    category.save();

    res.send("category created");
  } catch (err) {
    console.log(err);
  }
}
