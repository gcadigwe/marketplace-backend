import { Request, Response } from "express";
import { createUniqueNFT } from "../../controller/nft-controller";
import { buildHashBytes, getNextSwapId, getNextTokenID } from "../../utils";
import { getUsersByToken } from "../../utils/functions";
import { listNFT } from "../../utils/list";
import { mintNFT } from "../../utils/mint";
import { uploadFileToIpfs } from "../../utils/uploadVideo";

export async function ListVideoNFT(req: Request, res: Response) {
  try {
    const token: any = await getUsersByToken(req, res);
    if (token) {
      const files: any = req.files;

      const {
        name,
        description,
        price_type,
        price,
        mimeType,
        minimum_bid,
        maximum_bid,
        endTime,
        startTime,
        wearable,
        feature,
        featureValue,
      } = JSON.parse(req.body.createDetails);

      if (files) {
        if (mimeType == "video/mp4") {
          console.log("video on server");
          let thumbnail = files?.filter(
            (file: any) => file.fieldname === "thumbnail"
          );

          let video = files?.filter((file: any) => file.fieldname === "video");

          let thumbnailHash = await uploadFileToIpfs(
            thumbnail[0].filename,
            thumbnail[0].originalname
          );

          let videoHash = await uploadFileToIpfs(
            video[0].filename,
            video[0].originalname
          );

          let amount = 1;

          const tokenId = await getNextTokenID();

          const tokenBytes = await buildHashBytes(
            name,
            description,
            videoHash,
            token.payload.user_id,
            tokenId,
            thumbnailHash,
            "video/mp4"
          );

          await mintNFT(tokenId, amount, tokenBytes);

          await listNFT(
            price_type,
            price,
            tokenId,
            amount,
            minimum_bid,
            maximum_bid,
            endTime,
            startTime
          );

          res
            .status(200)
            .json({ msg: "NFT Was Minted and Listed on the Marketplace" });
        } else {
          //   let thumbnail = files?.filter(
          //     (file: any) => file.fieldname === "thumbnail"
          //   );

          try {
            console.log("image on server");

            let image = files?.filter(
              (file: any) => file.fieldname === "image"
            );

            //   let thumbnailHash = await uploadFileToIpfs(
            //     thumbnail[0].filename,
            //     thumbnail[0].originalname
            //   );

            let imageHash = await uploadFileToIpfs(
              image[0].filename,
              image[0].originalname
            );

            let amount = 1;

            const tokenId = await getNextTokenID();
            const swapId = await getNextSwapId();

            // console.log("swap", swapId.toString());

            const tokenBytes = await buildHashBytes(
              name,
              description,
              imageHash,
              token.payload.user_id,
              tokenId,
              imageHash,
              "image/png",
              wearable,
              feature,
              featureValue
            );

            await mintNFT(tokenId, amount, tokenBytes);

            const completed = await listNFT(
              price_type,
              price,
              tokenId,
              amount,
              minimum_bid,
              maximum_bid,
              endTime,
              startTime
            );

            if (completed) {
              await createUniqueNFT({
                name: `${name} #${tokenId}`,
                description: description,
                price_type: price_type,
                minimum_bid: minimum_bid,
                maximum_bid: maximum_bid,
                images: [imageHash],
                creator: token.payload.user_id,
                mimeType: "image/png",
                swapId: swapId,
                price: price,
              });

              res
                .status(200)
                .json({ msg: "NFT Was Minted and Listed on the Marketplace" });
            }
          } catch (err) {
            res.status(500).json({ msg: "Server Error" });
          }
        }
      }
    }
  } catch (err) {
    console.log("error");
    console.log(err);
    res.status(500).json({ msg: "Server Error" });
  }
}
