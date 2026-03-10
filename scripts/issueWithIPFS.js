require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto");
const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("=================================");
    console.log("Uploading PDF to IPFS...");
    console.log("=================================");

    const filePath = "./certificateuploads/ibm.pdf";

    if (!fs.existsSync(filePath)) {
      console.log("File not found at:", filePath);
      return;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const fileHashBytes32 = "0x" + hash;

    console.log("Computed file hash:", fileHashBytes32);

    console.log("\nUploading to IPFS via Pinata...");

    const data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    const uploadRes = await axios.post(
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

    const cid = uploadRes.data.IpfsHash;
    console.log("IPFS upload successful:", cid);

    console.log("\nConnecting to blockchain...");

    const contractAddress = process.env.CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    const [signer] = await ethers.getSigners();
    console.log("Connected wallet:", signer.address);

    const contract = await ethers.getContractAt("CertificateStorage", contractAddress, signer);

    console.log("\nChecking institute status...");

    const institute = await contract.institutes(signer.address);
    if (institute.registeredAt === 0n) {
      console.log("Wallet is not registered as an institute");
      return;
    }

    if (!institute.isActive) {
      console.log("Institute is not active");
      return;
    }

    console.log("Institute:", institute.name);
    console.log("Institute ID:", institute.id);

    console.log("\nIssuing certificate on blockchain...");

    const studentName = "Bharat Bahadur Kadayat";
    const course = "Python 101 for Data Science";
    const studentWallet = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    const exists = await contract.certificateExists(fileHashBytes32);
    if (exists) {
      console.log("Certificate with this hash already exists");
      return;
    }

    const tx = await contract.issueCertificate(
      studentName,
      course,
      cid,
      fileHashBytes32,
      studentWallet,
      "STU-1002",
      "A+",
      4,
      "6 weeks",
      ["Python", "Data Science"]
    );

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();

    console.log("Transaction confirmed in block:", receipt.blockNumber);

    const cert = await contract.verifyCertificate(fileHashBytes32);

    console.log("\n=================================");
    console.log("CERTIFICATE ISSUED SUCCESSFULLY");
    console.log("=================================");
    console.log("Student Name:", cert[0]);
    console.log("Course:", cert[1]);
    console.log("IPFS Hash:", cert[2]);
    console.log("File Hash:", cert[3]);
    console.log("Issuer:", cert[4]);
    console.log("Student:", cert[5]);
    console.log("Issued At:", new Date(Number(cert[6]) * 1000).toLocaleString());
    console.log("Revoked:", cert[7] ? "Yes" : "No");
    console.log("Institute:", cert[8]);
    console.log("=================================");
  } catch (error) {
    console.error("\nError occurred:");
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else if (error.transaction) {
      console.error("Transaction Error:", error.message);
    } else {
      console.error(error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
