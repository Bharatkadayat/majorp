require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    // Get certificate ID from command line or use default
    const certificateId = process.argv[2] || "0x826d5e11f7904249dbe09fbd4237c25d7825c35362a9dbc866bae97116447381";
    
    // Get contract address from env or use default
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    console.log("=================================");
    console.log("🔍 Verifying Certificate on Blockchain");
    console.log("=================================");
    console.log("Certificate ID:", certificateId);
    console.log("Contract Address:", contractAddress);
    console.log("=================================");

    // Get contract instance
    const contract = await ethers.getContractAt(
      "CertificateStorage",
      contractAddress
    );

    // Check if certificate exists
    const exists = await contract.certificateExists(certificateId);
    if (!exists) {
      console.log("❌ Certificate not found on blockchain");
      return;
    }

    // Verify certificate
    console.log("\n📡 Fetching from blockchain...");
    const result = await contract.verifyCertificate(certificateId);

    // Parse results
    const studentName = result[0];
    const course = result[1];
    const ipfsHash = result[2];
    const fileHash = result[3];
    const issuer = result[4];
    const student = result[5];
    const issuedAt = new Date(Number(result[6]) * 1000);
    const revoked = result[7];
    const instituteName = result[8];

    console.log("\n📋 Certificate Details:");
    console.log("   Institute:", instituteName);
    console.log("   Student Name:", studentName);
    console.log("   Course:", course);
    console.log("   Student Wallet:", student);
    console.log("   Issuer:", issuer);
    console.log("   Issued At:", issuedAt.toLocaleString());
    console.log("   Status:", revoked ? "❌ REVOKED" : "✅ ACTIVE");
    console.log("   IPFS CID:", ipfsHash);
    console.log("   File Hash:", fileHash);

    if (!revoked) {
      console.log("\n📎 View Certificate:");
      console.log(`   https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    }

    console.log("\n=================================");
    console.log("✅ Verification Complete");
    console.log("=================================");

  } catch (error) {
    console.error("\n❌ Verification Failed");
    if (error.message.includes("Certificate not found")) {
      console.error("   Certificate ID not found on blockchain");
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

module.exports = { verifyWithHash: main };
