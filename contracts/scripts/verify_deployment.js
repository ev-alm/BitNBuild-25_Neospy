// contracts/scripts/verify_deployment.js
const hre = require("hardhat");

async function main() {
  console.log("--- Starting Deployment Verification Script ---");

  // 1. Get Signers
  const [admin, relayer] = await hre.ethers.getSigners();
  console.log(`Deployer (Admin) address: ${admin.address}`);

  // 2. Deploy the contract
  console.log("Deploying contract...");
  const ProofOfPresence = await hre.ethers.getContractFactory("ProofOfPresence");
  const contract = await ProofOfPresence.deploy(admin.address, relayer.address);
  await contract.waitForDeployment();
  const contractAddress = contract.target;
  console.log(`Contract deployed to: ${contractAddress}`);

  // 3. Create a NEW contract instance attached to the deployed address
  // This simulates what our backend is doing, but within the Hardhat environment.
  console.log("\n--- Verification Step ---");
  console.log("Attaching to deployed contract instance...");
  const deployedContract = await hre.ethers.getContractAt("ProofOfPresence", contractAddress);

  // 4. Try to call the name() function
  try {
    console.log("Attempting to call deployedContract.name()...");
    const name = await deployedContract.name();
    console.log(`✅ SUCCESS: Read contract name: "${name}"`);
  } catch (error) {
    console.error("❌ FAILURE: Could not call contract.name().");
    console.error("This confirms the deployment is the source of the problem.");
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});