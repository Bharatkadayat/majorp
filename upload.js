require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto");

// Check for JWT token
if (!process.env.PINATA_JWT) {
  console.error("❌ PINATA_JWT not found in .env file");
  console.log("\n📝 Please add to your root .env file:");
  console.log("PINATA_JWT=your_jwt_token_here");
  process.exit(1);
}

const filePath = process.argv[2] || "./certificateuploads/ibm.pdf";

async function uploadFile() {
  try {
    console.log("=================================");
    console.log("📤 Uploading to Pinata IPFS");
    console.log("=================================");
    console.log("File:", filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      console.log("\n📝 Usage: node upload.js <file-path>");
      console.log("   Example: node upload.js ./certificateuploads/ibm.pdf");
      return;
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    console.log("Size:", (stats.size / 1024).toFixed(2), "KB");

    // Compute file hash
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    console.log("SHA-256 Hash:", "0x" + hash);

    // Upload to IPFS
    console.log("\n📡 Uploading to IPFS...");
    
    const data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    console.log("\n✅ Upload Successful!");
    console.log("=================================");
    console.log("📌 IPFS CID:", res.data.IpfsHash);
    console.log("📌 Gateway URL:", `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`);
    console.log("📌 Pin Size:", res.data.PinSize);
    console.log("📌 Timestamp:", res.data.Timestamp);
    console.log("=================================");
    
    // Save info to file
    const uploadInfo = {
      file: filePath,
      cid: res.data.IpfsHash,
      hash: "0x" + hash,
      timestamp: new Date().toISOString(),
      size: stats.size
    };
    
    fs.writeFileSync(
      "./upload-info.json", 
      JSON.stringify(uploadInfo, null, 2)
    );
    console.log("📁 Upload info saved to upload-info.json");

  } catch (error) {
    console.error("\n❌ Upload Failed");
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  uploadFile();
}

module.exports = { uploadFile };