const hre = require("hardhat");

const paymentTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  const DAOToken = await ethers.getContractFactory("DAOToken");
  const DAONFT = await ethers.getContractFactory("DAONFT");

  const DAO = await ethers.getContractFactory("DAO");
  dao = await DAO.deploy(paymentTokenAddress);

  daoToken = DAOToken.attach(await dao.daoToken());
  daoNFT = DAONFT.attach(await dao.daoNFT());

  console.log("DAO deployed to:", dao.address);
  console.log("DAO Token deployed to:", daoToken.address);
  console.log("DAO NFT deployed to:", daoNFT.address);

  console.log("Deployment and tests completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
