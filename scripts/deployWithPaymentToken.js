const hre = require("hardhat");

async function main() {
  const PaymentToken = await ethers.getContractFactory("PaymentToken");
  const paymentToken = await PaymentToken.deploy(
    ethers.utils.parseEther("1000000")
  );
  console.log("payment token deployed");
  const DAO = await ethers.getContractFactory("DAO");
  const dao = await DAO.deploy(paymentToken.address);
  console.log("DAO contract deployed");

  console.log("Payment Token deployed to:", paymentToken.address);
  console.log("-".repeat(30));
  console.log("DAO deployed to:", dao.address);
  console.log("DAO Token deployed to:", await dao.daoToken());
  console.log("DAO NFT deployed to:", await dao.daoNFT());

  console.log("Deployment and tests completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
