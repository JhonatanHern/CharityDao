// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DAOToken is ERC20 {
    address public daoContract;

    constructor() ERC20("DAO Coin", "DC") {
        daoContract = msg.sender;
    }

    function mint(address _to, uint256 _amount) public {
        require(msg.sender == daoContract, "Only DAO contract can mint");
        _mint(_to, _amount);
    }
}
