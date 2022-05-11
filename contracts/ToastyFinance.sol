// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ToastyFinance {
  ERC20 public toast;
  uint rewardsPercentPerDay = 1;

  struct Account {
    uint amount;
    uint updatedAt;
  }

  mapping(address => Account) public accounts;

  constructor(address _token) {
    toast = ERC20(_token);
  }

  function deposit(uint _amount) public {
    uint rewards = pendingRewards(block.timestamp);
    accounts[msg.sender].amount += rewards; // update amount with pending rewards

    accounts[msg.sender].amount += _amount;
    accounts[msg.sender].updatedAt = block.timestamp;
    toast.transferFrom(msg.sender, address(this), _amount);
  }

  function withdraw(uint _amount) public {
    uint rewards = pendingRewards(block.timestamp);
    accounts[msg.sender].amount += rewards; // update amount with pending rewards
    require(_amount <= accounts[msg.sender].amount, 'Amount error');

    accounts[msg.sender].amount -= _amount; // withdraw amount
    accounts[msg.sender].updatedAt = block.timestamp;
    toast.transfer(msg.sender, _amount);
  }

  function pendingRewards(uint _timestamp) public view returns(uint) {
    uint secondsElapsed = _timestamp - accounts[msg.sender].updatedAt;
    uint rewardsPerSecond = (rewardsPercentPerDay * 1e16 /86400);
    return ((accounts[msg.sender].amount * rewardsPerSecond * secondsElapsed) / 1e16) / 100;
  }
}
