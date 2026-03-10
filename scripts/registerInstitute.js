const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function resolveContractAddress() {
  if (process.env.CONTRACT_ADDRESS) {
    return process.env.CONTRACT_ADDRESS;
  }

  const addressFile = path.join(__dirname, "../frontend/src/utils/contractAddress.json");
  if (fs.existsSync(addressFile)) {
    const parsed = JSON.parse(fs.readFileSync(addressFile, "utf8"));
    if (parsed.address) return parsed.address;
  }

  throw new Error("Contract address not found. Set CONTRACT_ADDRESS or run deploy script first.");
}

async function main() {
  const contractAddress = resolveContractAddress();
  const instituteAddress = process.argv[2];

  if (!instituteAddress || !hre.ethers.isAddress(instituteAddress)) {
    throw new Error("Provide institute wallet as argument. Example: npx hardhat run scripts/registerInstitute.js --network localhost -- 0x...");
  }
  
  const contract = await hre.ethers.getContractAt("CertificateStorage", contractAddress);
  
  console.log("=================================");
  console.log("Registering Institute...");
  console.log("=================================");
  console.log("Institute Address:", instituteAddress);
  
  const tx = await contract.registerInstitute(
    instituteAddress,
    "Tech University",
    "INST001",
    "admin@techuniversity.edu",
    "https://techuniversity.edu",
    "John Admin",
    "contact@techuniversity.edu",
    "+1-555-000-1111",
    "Director",
    2005,
    "National Accreditation Board",
    "Technology-focused institute",
    "Learn by Building",
    4000,
    250,
    45,
    "https://twitter.com/techuniversity",
    "https://linkedin.com/school/techuniversity",
    "TAX-12345",
    "REG-2026-001"
  );
  
  await tx.wait();
  console.log("✅ Institute registered successfully!");
  console.log("=================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
