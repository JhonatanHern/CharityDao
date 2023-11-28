require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
const dotEnvConfig = require("dotenv").config;
dotEnvConfig();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com", // Mumbai testnet RPC URL
      accounts: [process.env.PRIVATE_KEY], // Replace with your account's private key
    },
  },
};

/*
  npx hardhat create-proposal --daoaddress <dao-address> --deadline <deadline> --minimumvotes <minimum-votes> --amount <amount> --recipient <recipient>
  daoaddress: 0x501F418B93A6758E2252c1dc86Be3f0617F63FCa - deployed address in mumbai testnet
  deadline: 1622505600                                   - deadline in seconds since epoch
  minimumvotes: 100                                      - minimum votes required for the proposal to pass
  amount: 100000000000000000000                          - with the payment token decimals included. Default is 18
  recipient: 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2  - address of the recipient of the tokens once the proposal is executed
  example:
  npx hardhat create-proposal --network mumbai --daoaddress 0x501F418B93A6758E2252c1dc86Be3f0617F63FCa --deadline 1622505600 --minimumvotes 100 --amount 100000000000000000000 --recipient 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
*/
task("create-proposal", "Create a proposal in an existing DAO contract")
  .addParam("daoaddress", "The address of the DAO contract")
  .addParam("deadline", "The deadline for the proposal")
  .addParam("minimumvotes", "The minimum votes required for the proposal")
  .addParam("amount", "The amount of tokens to transfer")
  .addParam("recipient", "The recipient of the tokens")
  .setAction(async (taskArgs, hre) => {
    const { daoaddress, deadline, minimumvotes, amount, recipient } = taskArgs;
    if (!daoaddress) {
      console.log("DAO contract address missing");
      return;
    }
    if (!deadline || !minimumvotes || !amount || !recipient) {
      console.log("Proposal data is missing");
      return;
    }
    const DAO = await hre.ethers.getContractFactory("DAO");
    const dao = DAO.attach(daoaddress);

    const createProposalTx = await dao.createProposal(
      deadline,
      minimumvotes,
      amount,
      recipient
    );
    const receipt = await createProposalTx.wait();
    const proposalCreatedEvent = receipt.events.find(
      (event) => event.event === "ProposalCreated"
    );

    console.log(
      `Proposal with ID: '${proposalCreatedEvent.args.proposalId.toNumber()}' created in DAO`
    );
  });

/*
  npx hardhat executeProposal --daoaddress <dao-address> --proposalId <proposal-id>
  daoaddress: 0x501F418B93A6758E2252c1dc86Be3f0617F63FCa - deployed address in mumbai testnet
  proposalId: 0                                         - ID of the proposal to execute
  example:
  npx hardhat executeProposal --network mumbai --daoaddress 0x501F418B93A6758E2252c1dc86Be3f0617F63FCa --proposalId 0
*/
task("executeProposal", "Execute a proposal in the DAO")
  .addParam("daoaddress", "Address of the DAO contract")
  .addParam("proposalId", "ID of the proposal to execute")
  .setAction(async (taskArgs) => {
    const { daoaddress, proposalId } = taskArgs;

    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.attach(daoaddress);

    const executeProposalTx = await dao.executeProposal(proposalId);
    await executeProposalTx.wait();

    console.log(`Proposal with ID: '${proposalId}' executed in DAO`);
  });
