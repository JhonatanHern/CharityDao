# Smart Charity DAO

In order to run the entire project, three repositories are needed:
- This one
- https://github.com/JhonatanHern/CharityDaoFrontend (frontend)
- https://github.com/JhonatanHern/CharityDaoBackend (backend)

## Global setup

After downloading the three repositories there are three steps for the setup:

### 1 - .env files and package install
Contracts:
```
PRIVATE_KEY=0x35dcf656a1fd701ca7bf9f60ffe98e0af8e7276ff7ca5bc109a7128d46641a3a
MUMBAI_URL=https://polygon-mumbai.g.alchemy.com/v2/MPaBZ4P5gZB6xeldpNR6kazfV9K7xirV
PINATA_API_KEY=0f4e89b5a43e1aef598c
PINATA_API_SECRET=09ead9cd5e6fad321f05051a8ff72d1fd99b9f4a4f761e6586569e99218611a5
```
Frontend:
```
VITE_ALCHEMY_API_KEY=MPaBZ4P5gZB6xeldpNR6kazfV9K7xirV
```
Backend:
```
DAO_CONTRACT_ADDRESS=0xe0B810e10420Da732e461db829FFa6349f4ABE80
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/MPaBZ4P5gZB6xeldpNR6kazfV9K7xirV
PINATA_GATEWAY_ID=harlequin-official-deer-46
```
Add every .env file to the root folder of it's corresponding repository.

Also, in each folder run `npm i`

### 2 - Contract preparation (optional)

If you are ok with using the existing smart contracts in the mumbai testnet, skip this step.

from this repo's (CharityDao) root folder, run the next command:

```
npx hardhat run scripts/deployWithPaymentToken.js --network mumbai
```

the output should look like this:
```
payment token deployed
DAO contract deployed
Payment Token deployed to: PAYMENT_TOKEN_ADDRESS
------------------------------
DAO deployed to: DAO_ADDRESS
DAO Token deployed to: DAO_TOKEN_ADDRESS
DAO NFT deployed to: DAO_NFT_ADDRESS
Deployment and tests completed successfully!
```

now copy the `DAO_ADDRESS` and paste it in the `CharityDaoBackend/.env` file to replace the current value of the `DAO_CONTRACT_ADDRESS` variable.

Then open `CharityDaoFrontend/src/utils/contracts.ts` and change the corresponding variables to the address propery of each contract object like this:

```
import { erc20ABI } from "wagmi";

export const paymentTokenContractConfig = {
  address: "<PAYMENT_TOKEN_ADDRESS>",
  ...
} as const;

export const daoTokenContractConfig = {
  address: "<DAO_TOKEN_ADDRESS>",
  ...
} as const;

export const DAOContractConfig = {
  address: "<DAO_ADDRESS>",
  ...
} as const;
```

### 3 - Backend setup

From the CharityDaoBackend repo's root folder run this command:

```
node index.js
```

### 4 - Frontend setup

From the CharityDaoFrontend repo's root folder run this command:

```
node run dev
```

## Proposal creation

While making sure that the backend server is on:

- Go to this repo's root folder
- Customize this command according to your needs:

`  npx hardhat create-proposal --network mumbai  --daoaddress <dao-address> --deadline <deadline> --minimumvotes <minimum-votes> --amount <amount> --recipient <recipient> --title <title> --description <description> --imageurl <image-url>
`
Explanation for each variable:
```
  daoaddress: 0xe0B810e10420Da732e461db829FFa6349f4ABE80 - deployed address in mumbai testnet
  deadline: 1622805600                                   - deadline in seconds since epoch
  minimumvotes: 100                                      - minimum votes required for the proposal to pass
  amount: 100000000000000000000                          - with the payment token decimals included. Default is 18
  recipient: 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2  - address of the recipient of the tokens once the proposal is executed
  title: "Proposal title"                                - title for the proposal
  description: "Proposal description"                    - description for the proposal
  imageurl: "https://picsum.photos/200"                  - URL to an image that conveys the proposal's message
```

Your command should look like this:
`  npx hardhat create-proposal --network mumbai --daoaddress 0xe0B810e10420Da732e461db829FFa6349f4ABE80 --deadline 1622805600 --minimumvotes 100 --amount 100000000000000000000 --recipient 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 --title "Proposal title" --description "Proposal description" --imageurl "https://picsum.photos/200"
`

- Run the command
- Wait for the transaction to be executed and for the backend server to catch it (this could take a while because IPFS is used in the background to store some variables)
- Refresh the frontend page to see the new project added

# Smart Charity DAO - Contract Structure

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
