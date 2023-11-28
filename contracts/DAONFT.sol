// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DAONFT is ERC721 {
    uint256 public tokenId;
    address public creator;

    constructor() ERC721("DAO NFT", "DNFT") {
        creator = msg.sender;
    }

    function mint(address _to) public {
        require(msg.sender == creator, "Only creator can mint");
        _safeMint(_to, tokenId);
        tokenId++;
    }
}
