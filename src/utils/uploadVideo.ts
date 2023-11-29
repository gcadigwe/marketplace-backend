import cloudinary from "cloudinary";
import { Request, Response } from "express";
import path from "path";
import pinataSDK from "@pinata/sdk";
import axios from "axios";
import fs from "fs";
import FormData = require("form-data");

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export async function uploadFileToIpfs(filename: string, originalName: string) {
  var form = new FormData();

  const readableStreamForFile = fs.createReadStream(
    path.join(__dirname, "..", "uploads", filename)
  );

  form.append("file", readableStreamForFile, {
    filename: originalName, //required or it fails
  });

  var config: any = {
    method: "post",
    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
    maxBodyLength: Infinity,
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET,
      ...form.getHeaders(),
    },
    data: form,
  };

  const hash = axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      fs.unlink(path.join(__dirname, "..", "uploads", filename), (err) => {
        if (err) {
          console.log(err);
        }
      });

      return response.data.IpfsHash;
    })
    .catch(function (error) {
      console.log(error);
      fs.unlink(path.join(__dirname, "..", "uploads", filename), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });

  return hash;
}
