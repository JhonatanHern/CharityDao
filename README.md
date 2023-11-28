# Smart Charity DAO - Smart Contracts

This project contains the smart contracts for a decentralized autonomous organization (DAO) that allows its token holders (ERC20) to vote on donation proposals.

## Contracts

The Smart Charity DAO allows anyone to propose donations and it's token holders to perform weighted voting by using their DAOCoin tokens.
The smart contracts consist of the following components:

### DAO.sol:

This is the main contract that implements the logic of the DAO. It allows DAOCoin token holders to vote on proposals via quadratic voting by using their DAOCoin tokens. It also allows anyone to create new proposals and donate funds via DAOFundToken tokens. Fund donation is rewarded via DAOCoin tokens at a rate set by the contract admin with an initial rate of 10x DAOCoin tokens as reward per x DAOFundToken tokens donated.

Each proposal is stored as a solidity struct with:

- Approval status
- Proposal deadline
- Votes for Yes
- Votes for No
- Votes casted by address
- Beneficiary address
- Donation amount

A proposal must be approved by an admin before voting is enabled (Approval status).

In order to be executed, a proposal must have more than half of the votes as approved.

The DAOCoin tokens used for voting are burned.

### NFT.sol:

Implements the ERC721 standard for non-fungible tokens (NFTs) and it allows the DAO to mint an NFT for each participation in a proposal as a reward. The DAO is the only address with permission to mint NFTs.

### DAOFundToken.sol:

The token used by investors to fund the DAO. In exchange for this token, the investors get rewarded with DAOCoin. The decisions taken by the DAO give these tokens to the beneficiaries of those decisions.

### DAOToken.sol:

The project token used for voting. Just a regular ERC20 token that is given as a reward for investing. The DAO contract has permission to mint tokens

## Installation

To install the dependencies, run the following command:

`npm install`
Testing
To run the tests, run the following command:

`npx hardhat test`

Deployment
To deploy the contracts to a local network, run the following command:

`npx hardhat run scripts/deploy.js --network localhost`

To deploy the contracts to a public network, edit the hardhat.config.js file with your network settings and private key, and run the following command:

`npx hardhat run scripts/deploy.js --network <network-name`>

## Hardhat Tasks

To list the available tasks, run the following command:

npx hardhat

To create a new proposal, run the following command:

`npx hardhat create-proposal --title "Title" --description "Description" --deadline 86400 --minvotes 1000 --optiona "Option A" --optionb "Option B"`

To vote on a proposal, run the following command:

`npx hardhat vote --id 0 --choice true // vote for option A on proposal 0`

To execute a proposal, run the following command:

`npx hardhat execute --id 0 // execute proposal 0`

To claim an NFT, run the following command:

`npx hardhat claim-nft --id 0 // claim NFT for proposal 0`

I