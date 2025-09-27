// contracts/scripts/deploy.js (Updated for Base URI)
const hre = require("hardhat");

async function main() {
  const [admin, relayer] = await hre.ethers.getSigners();
  
  // This is the URL to our backend's metadata endpoint
  const baseTokenURI = "http://localhost:3001/metadata/";

  console.log("Deploying contracts with the account:", admin.address);
  console.log("Admin address:", admin.address);
  console.log("Relayer address:", relayer.address);
  console.log(`Metadata Base URI will be: ${baseTokenURI}`);

  const ProofOfPresence = await hre.ethers.getContractFactory("ProofOfPresence");
  
  // Pass the baseTokenURI as the third argument to the constructor
  const proofOfPresence = await ProofOfPresence.deploy(admin.address, relayer.address, baseTokenURI);

  await proofOfPresence.waitForDeployment();

  console.log(
    `ProofOfPresence contract deployed to ${proofOfPresence.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});