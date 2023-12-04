require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");

const { uploadToIPFS } = require("./lib/uploadToIPFS");
const dotEnvConfig = require("dotenv").config;
dotEnvConfig();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    mumbai: {
      url: process.env.MUMBAI_URL, // Mumbai testnet RPC URL
      accounts: [process.env.PRIVATE_KEY], // Replace with your account's private key
    },
  },
};

/*
  npx hardhat create-proposal --daoaddress <dao-address> --deadline <deadline> --minimumvotes <minimum-votes> --amount <amount> --recipient <recipient> --title <title> --description <description> --imageurl <image-url>
  daoaddress: 0xe0B810e10420Da732e461db829FFa6349f4ABE80 - deployed address in mumbai testnet
  deadline: 1622805600                                   - deadline in seconds since epoch
  minimumvotes: 100                                      - minimum votes required for the proposal to pass
  amount: 100000000000000000000                          - with the payment token decimals included. Default is 18
  recipient: 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2  - address of the recipient of the tokens once the proposal is executed
  title: "Proposal title"                                - title for the proposal
  description: "Proposal description"                    - description for the proposal
  imageurl: "https://url.to/image"                       - URL to an image that conveys the proposal's message
  example:
  npx hardhat create-proposal --network mumbai --daoaddress 0xe0B810e10420Da732e461db829FFa6349f4ABE80 --deadline 1622805600 --minimumvotes 100 --amount 100000000000000000000 --recipient 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 --title "Proposal title" --description "Proposal description" --imageurl "https://url.to/image"
*/
task("create-proposal", "Create a proposal in an existing DAO contract")
  .addParam("daoaddress", "The address of the DAO contract")
  .addParam("deadline", "The deadline for the proposal")
  .addParam("minimumvotes", "The minimum votes required for the proposal")
  .addParam("amount", "The amount of tokens to transfer")
  .addParam("recipient", "The recipient of the tokens")
  .addParam("title", "The proposal's title")
  .addParam("description", "The proposal's description")
  .addParam("imageurl", "url to an image that conveys the proposal's message")
  .setAction(async (taskArgs, hre) => {
    const {
      daoaddress,
      deadline,
      minimumvotes,
      amount,
      recipient,
      title,
      description,
      imageurl,
    } = taskArgs;
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

    // strings like title and description (and any other data) must be uploaded to IPFS to prevent high storage costs.
    // only functional pieces of data must make it directly to the blockchain

    const dataHash = await uploadToIPFS(
      {
        title: title || "",
        description: description || "",
        imageURL: imageurl || "",
      },
      process.env.PINATA_API_KEY,
      process.env.PINATA_API_SECRET
    );

    console.log(`Proposal data uploaded to IPFS with hash: ${dataHash}`);

    const createProposalTx = await dao.createProposal(
      deadline,
      minimumvotes,
      amount,
      recipient,
      dataHash.toString()
    );

    console.log("Waiting for proposal to be created...");
    const receipt = await createProposalTx.wait();
    console.log("Proposal created!");
    const proposalCreatedEvent = receipt.events.find(
      (event) => event.event === "ProposalCreated"
    );

    console.log(
      `Proposal with ID: '${proposalCreatedEvent.args.proposalId.toNumber()}' created in DAO`
    );
  });
