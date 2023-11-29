import { Request, Response } from "express";
import { User } from "../models/user";
import {
  createToken,
  generateNonce,
  getUsersByToken,
  validateEmail,
} from "../utils/functions";
import bcrypt from "bcrypt";
import { BCRYPTROUND } from "../utils/constants";
import { verifySignature } from "@taquito/utils";

export async function registerUser(req: Request, res: Response) {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ msg: "Incomplete data" });
    }

    const isEmailValid = validateEmail(req.body.email);

    if (!isEmailValid) {
      res.status(400).json({ msg: "Invalid Email" });
    }

    let user = await User.findOne({ where: { email: req.body.email } });

    if (user) {
      res.status(400).json({ msg: "User already exists" });
    } else {
      const hash = bcrypt.hashSync(req.body.password, BCRYPTROUND);

      console.log(req.body.email);
      console.log(hash);

      let newuser = await User.create({
        email: req.body.email,
        password: hash,
        whitelisted: false,
      });

      newuser.save();

      const token = createToken(newuser, false);

      return res.status(200).json({
        msg: "user successfully registered",
        token,
      });
    }
  } catch (err: any) {
    // res.status(400).send("an error occurred");
    console.log(err);
  }
}

export async function loginWallet(req: Request, res: Response) {
  try {
    const { address, publicKey, message, signature } = req.body.loginDetails;

    const verify = verifySignature(message, publicKey, signature);

    if (verify) {
      const user = await User.findOne({ where: { walletAddress: address } });

      if (user) {
        const token = createToken(user, true);
        return res.status(200).json({
          msg: "user successfully logged in",
          token,
        });
      } else {
        let newuser = await User.create({
          walletAddress: address,
          whitelisted: false,
          none: generateNonce(),
        });

        newuser.save();

        const token = createToken(newuser, true);

        return res.status(200).json({
          msg: "user successfully registered",
          token,
        });
      }
    } else {
      // console.log("cannot verify signature");
      res.status(400).json({
        msg: "cannot verify signature",
      });
    }
  } catch (err) {
    console.log(err);
  }
}

// export async function refreshToken(req: Request, res: Response) {
//   const token = getUsersByToken();
// }
