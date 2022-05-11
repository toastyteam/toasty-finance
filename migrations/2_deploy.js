const Toasty = artifacts.require("Toasty")
const ToastyFinance = artifacts.require("ToastyFinance")
const Web3 = require('web3')

function toWei(n) {
  return Web3.utils.toWei(n, 'ether')
}

function toEth(n) {
  return Web3.utils.fromWei(n, 'ether')
}

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Toasty)
  let toasty = await Toasty.deployed()

  await deployer.deploy(ToastyFinance, toasty.address)
  let toastyFinance = await ToastyFinance.deployed()

  let toastyBalance = await toasty.balanceOf(accounts[0])
  let thirdBalance = toWei((parseInt(toEth(toastyBalance)) / 3).toString())
  await toasty.transfer(toastyFinance.address, thirdBalance)
  await toasty.transfer(toastyFinance.address, thirdBalance)
  // keep 1/3 of tokens for LP
};
