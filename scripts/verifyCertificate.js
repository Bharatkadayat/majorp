require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  try {
    // You can pass certificate ID as command line argument
    const certificateId = process.argv[2] || "0x6fdcc49374416a43aeea4d82d07ba48be41bfa417881d2eb0d745921e500d921";
    
    // Get contract address from env or use default
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    console.log("=================================");
    console.log("🔍 Verifying Certificate");
    console.log("=================================");
    console.log("Certificate ID:", certificateId);
    console.log("Contract Address:", contractAddress);
    console.log("=================================");

    // Get contract instance
    const contract = await ethers.getContractAt(
      "CertificateStorage",
      contractAddress
    );

    // Fetch from blockchain
    console.log("\n📡 Fetching from blockchain...");
    const cert = await contract.verifyCertificate(certificateId);

    const studentName = cert[0];
    const course = cert[1];
    const ipfsHash = cert[2];
    const storedFileHash = cert[3];
    const issuer = cert[4];
    const student = cert[5];
    const issuedAt = new Date(Number(cert[6]) * 1000);
    const revoked = cert[7];
    const instituteName = cert[8];

    console.log("\n📋 Certificate Details:");
    console.log("   Institute:", instituteName);
    console.log("   Student:", studentName);
    console.log("   Course:", course);
    console.log("   Student Wallet:", student);
    console.log("   Issuer:", issuer);
    console.log("   Issued:", issuedAt.toLocaleString());
    console.log("   Status:", revoked ? "❌ REVOKED" : "✅ ACTIVE");
    console.log("   IPFS Hash:", ipfsHash);
    console.log("   Stored File Hash:", storedFileHash);

    if (revoked) {
      console.log("\n⚠️  This certificate has been REVOKED!");
      return;
    }

    // Download from IPFS
    console.log("\n📥 Downloading from IPFS...");
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    console.log("   URL:", url);
    
    const response = await axios.get(url, { 
      responseType: "arraybuffer",
      timeout: 10000 
    });

    const downloadedBuffer = Buffer.from(response.data);
    console.log("   Download complete!");
    console.log("   File size:", downloadedBuffer.length, "bytes");

    // Verify hash
    console.log("\n🔐 Verifying file integrity...");
    const computedHash = "0x" + crypto.createHash("sha256").update(downloadedBuffer).digest("hex");
    
    console.log("   Stored Hash:", storedFileHash);
    console.log("   Computed Hash:", computedHash);

    console.log("\n=================================");
    if (computedHash === storedFileHash) {
      console.log("✅ RESULT: AUTHENTIC CERTIFICATE");
      console.log("   The file matches the blockchain record");
    } else {
      console.log("❌ RESULT: TAMPERED OR FAKE CERTIFICATE");
      console.log("   The file has been modified!");
    }
    console.log("=================================");

  } catch (error) {
    console.error("\n❌ Verification Failed");
    if (error.message.includes("Certificate not found")) {
      console.error("   Certificate ID not found on blockchain");
    } else if (error.code === 'ECONNREFUSED') {
      console.error("   Cannot connect to IPFS gateway");
    } else {
      console.error("   Error:", error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verify: main };
