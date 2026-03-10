const hre = require("hardhat");
const crypto = require("crypto");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const studentAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Account #2
  
  // Use Institute wallet (Account #1)
  const instituteWallet = new hre.ethers.Wallet(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    hre.ethers.provider
  );
  
  const contract = await hre.ethers.getContractAt("CertificateStorage", contractAddress, instituteWallet);
  
  console.log("=================================");
  console.log("Issuing Certificate...");
  console.log("=================================");
  console.log("Institute Address:", instituteWallet.address);
  console.log("Student Address:", studentAddress);
  
  const fileHash = "0x" + crypto.randomBytes(32).toString("hex");
  const ipfsHash = "QmTest123456789";
  
  const tx = await contract.issueCertificate(
    "John Student",
    "Bachelor of Computer Science",
    ipfsHash,
    fileHash,
    studentAddress,
    "STU-1001",
    "A",
    120,
    "4 years",
    ["Programming", "Databases", "Cloud"]
  );
  
  await tx.wait();
  console.log("✅ Certificate issued successfully!");
  console.log("=================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
