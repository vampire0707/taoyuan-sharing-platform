import { v2 as cloudinary } from "cloudinary";

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

console.log("✅ cloud_name:", cloud_name || "(missing)");
console.log("✅ api_key:", api_key || "(missing)");
console.log("✅ api_secret set:", api_secret ? "yes" : "no");

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

export default cloudinary;
