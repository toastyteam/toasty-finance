// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Toasty is ERC20, Ownable {
  constructor() ERC20('TOAST token', 'TOAST') {
    _mint(msg.sender, 1000000000e18); // 1 000,000,000 tokens
  }

  function mint(uint256 _amount) public onlyOwner {
    _mint(msg.sender, _amount);
  }

  function burn(uint256 _amount) public onlyOwner {
    _burn(msg.sender, _amount);
  }
}
