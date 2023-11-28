const hre = require("hardhat");

async function main() {
  const PaymentToken = await ethers.getContractFactory("PaymentToken");
  const DAOToken = await ethers.getContractFactory("DAOToken");
  const DAONFT = await ethers.getContractFactory("DAONFT");
  paymentToken = await PaymentToken.deploy(ethers.utils.parseEther("1000000"));

  const DAO = await ethers.getContractFactory("DAO");
  dao = await DAO.deploy(paymentToken.address);

  daoToken = DAOToken.attach(await dao.daoToken());
  daoNFT = DAONFT.attach(await dao.daoNFT());

  console.log("Payment Token deployed to:", paymentToken.address);
  console.log("-".repeat(30));
  console.log("DAO deployed to:", dao.address);
  console.log("DAO Token deployed to:", daoToken.address);
  console.log("DAO NFT deployed to:", daoNFT.address);

  console.log("Deployment and tests completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
