const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

function loadEnvAsMap(filePath) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const lines = existing
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0 && !line.trim().startsWith("#"));
  const map = {};
  for (const line of lines) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      map[line.slice(0, idx)] = line.slice(idx + 1);
    }
  }
  return map;
}

function writeEnvFromMap(filePath, map) {
  const data = Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.writeFileSync(filePath, data);
}

async function main() {
  console.log("=================================");
  console.log("Deploying CertificateStorage...");
  console.log("=================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with wallet:", deployer.address);

  const CertificateStorage = await hre.ethers.getContractFactory("CertificateStorage");
  const contract = await CertificateStorage.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("Contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);

  const frontendUtils = path.join(__dirname, "../frontend/src/utils");
  if (!fs.existsSync(frontendUtils)) {
    fs.mkdirSync(frontendUtils, { recursive: true });
  }

  const addressFile = path.join(frontendUtils, "contractAddress.json");
  fs.writeFileSync(
    addressFile,
    JSON.stringify(
      {
        address: contractAddress,
        network: hre.network.name,
        admin: deployer.address,
        deployedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
  console.log("contractAddress.json updated");

  const artifact = require("../artifacts/contracts/CertificateStorage.sol/CertificateStorage.json");
  const abiFile = path.join(frontendUtils, "CertificateStorage.json");
  fs.writeFileSync(abiFile, JSON.stringify({ abi: artifact.abi }, null, 2));
  console.log("ABI exported to frontend");

  const frontendEnvFile = path.join(__dirname, "../frontend/.env");
  const frontendEnv = loadEnvAsMap(frontendEnvFile);
  frontendEnv.REACT_APP_CONTRACT_ADDRESS = contractAddress;
  frontendEnv.REACT_APP_NETWORK = hre.network.name;
  if (!frontendEnv.REACT_APP_API_URL) {
    frontendEnv.REACT_APP_API_URL = "http://127.0.0.1:4000";
  }
  writeEnvFromMap(frontendEnvFile, frontendEnv);
  console.log("Frontend .env updated");

  const rootEnvFile = path.join(__dirname, "../.env");
  const rootEnv = loadEnvAsMap(rootEnvFile);
  rootEnv.ADMIN_WALLET = deployer.address;
  writeEnvFromMap(rootEnvFile, rootEnv);
  console.log("Root .env ADMIN_WALLET updated");

  const configFile = path.join(__dirname, "../frontend/src/config.js");
  fs.writeFileSync(
    configFile,
    [
      "// AUTO GENERATED FILE",
      `export const CONTRACT_ADDRESS = "${contractAddress}";`,
      `export const NETWORK = "${hre.network.name}";`,
      `export const ADMIN_ADDRESS = "${deployer.address}";`
    ].join("\n")
  );
  console.log("config.js generated");

  console.log("=================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("=================================");
}

main().catch((error) => {
  console.error("Deployment error:", error);
  process.exit(1);
});

