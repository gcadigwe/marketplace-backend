import cloudinary from "cloudinary";
import path, { dirname } from "path";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const opts: cloudinary.UploadApiOptions = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

// cloudinary.v2.url('')
cloudinary.v2.uploader.destroy("");

export async function destroy(url: string) {
  try {
    cloudinary.v2.uploader
      .destroy(url)
      .then(() => {
        console.log("destroy", url);
        return true;
      })
      .catch(() => {
        console.log("error");
        return false;
      });
  } catch (err) {
    console.log(err);
  }
}
export async function upload(image: any) {
  const imageArray = [];
  for (let i = 0; i < image.length; i++) {
    const img = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(image[i], opts, (error, result) => {
        if (result && result.secure_url) {
          console.log(result);
          return resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            mimeType: "image/jpg",
          });
        }
        console.log(error?.message);
        return reject({ message: error?.message });
      });
    });

    imageArray.push(img);
  }

  return imageArray;
}
