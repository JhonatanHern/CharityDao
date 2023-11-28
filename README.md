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

## Testing

To run the tests, run the following command:

`npx hardhat test`

Deployment
To deploy the contracts to a local network, run the following command:

`npx hardhat run scripts/deployWithPaymentToken.js --network localhost`

To deploy the contracts to a public network, edit the hardhat.config.js file with your network settings and private key, and run the following command:

`npx hardhat run scripts/deployWithPaymentToken.js --network <network-name>`

## Hardhat Tasks

To list the available tasks, run the following command:

npx hardhat

To create a new proposal (if you posess an admin wallet), run the following command:

```
npx hardhat create-proposal --network mumbai --daoaddress 0x501F418B93A6758E2252c1dc86Be3f0617F63FCa --deadline 1622505600 --minimumvotes 100 --amount 100000000000000000000 --recipient 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
```

Explained:
```
  npx hardhat create-proposal --daoaddress <dao-address> --deadline <deadline> --minimumvotes <minimum-votes> --amount <amount> --recipient <recipient>
  daoaddress: 0x501F418B93A6758E2252c1dc86Be3f0617F63FCa - deployed address in mumbai testnet
  deadline: 1622505600                                   - deadline in seconds since epoch
  minimumvotes: 100                                      - minimum votes required for the proposal to pass
  amount: 100000000000000000000                          - with the payment token decimals included. Default is 18
  recipient: 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2  - address of the recipient of the tokens once the proposal is executed
```
For any other tasks use the user interface.
