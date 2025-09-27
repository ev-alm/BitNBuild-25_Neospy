const hre = require("hardhat");

async function main() {
  const [admin, relayer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", admin.address);
  console.log("Admin address:", admin.address);
  console.log("Relayer address:", relayer.address);

  const ProofOfPresence = await hre.ethers.getContractFactory("ProofOfPresence");

  const proofOfPresence = await ProofOfPresence.deploy(admin.address, relayer.address);

  await proofOfPresence.waitForDeployment(); // Ethers v6 deployment wait

  console.log(
    `ProofOfPresence contract deployed to ${proofOfPresence.target}` // use .target instead of .address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
