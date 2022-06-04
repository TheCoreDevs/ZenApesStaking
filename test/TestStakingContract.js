const Web3 = require('web3')
const chai = require('chai')
const assert = chai.assert
const BigNumber = require('bignumber.js')

const ZenStakingSrc = require('../build/contracts/ZenStaking.json')
const ZenApesSrc = require('../build/contracts/ZenApes.json')
const ZenTokenSrc = require('../build/contracts/ZenToken.json')

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
web3.transactionConfirmationBlocks = 1;

describe('Staking Test', function () {

  let ZenStaking
  let ZenToken
  let ZenApes
  let accounts
  

  beforeEach(async() => {
    accounts = await web3.eth.getAccounts()
    ZenStaking = new web3.eth.Contract(ZenStakingSrc.abi)
    ZenApes = new web3.eth.Contract(ZenApesSrc.abi)
    ZenToken = new web3.eth.Contract(ZenTokenSrc.abi)

    ZenApes = await ZenApes.deploy({data: ZenApesSrc.bytecode}).send({from: accounts[0], gas: 10000000})
    await ZenApes.methods.ownerMint(accounts[0], 10).send({from: accounts[0], gas: 10000000})

    ZenToken = await ZenToken.deploy({data: ZenTokenSrc.bytecode}).send({from: accounts[0], gas: 10000000})

    let args = [new BigNumber(1e18), 20, ZenApes.options.address, ZenToken.options.address]

    ZenStaking = await ZenStaking.deploy({data: ZenStakingSrc.bytecode, arguments: args}).send({from: accounts[0], gas: 10000000})
  })

  it('First account should have 10 Zen Apes', async() => {
    let ZenApesBal = await ZenApes.methods.balanceOf(accounts[0]).call({from: accounts[0]})
    assert.equal(ZenApesBal, 10)
  })

  it('All params are set correctly', async() => {
    let addresses = ZenStaking.methods.getContractAddresses().call({from: accounts[0]})
    assert.equal(addresses.zenApes, ZenApes.options.address)
    assert.equal(addresses.zenToken, ZenToken.options.address)
  })

  // it('Test normal withdraw', async() => {
  //   // send 1 eth to the splitter
  //   await web3.eth.sendTransaction({to: Splitter._address, from: accounts[0], value: web3.utils.toHex(new BigNumber(1e18))})

  //   let startBal = Number(await web3.eth.getBalance(accounts[1])) // all 6 are the same as this

  //   await Splitter.methods.withdraw().send({from: accounts[0], gas:10000000})

  //   let bal1 = await web3.eth.getBalance(accounts[1])
  //   assert(bal1 == startBal + (1e18 * 0.02), 'Should have gained 0.02 eth')

  //   let bal2 = await web3.eth.getBalance(accounts[2])
  //   assert(bal2 == startBal + (1e18 * 0.03), 'Should have gained 0.03 eth')

  //   let bal3 = await web3.eth.getBalance(accounts[3])
  //   assert(bal3 == startBal + (1e18 * 0.1), 'Should have gained 0.1 eth')

  //   let bal4 = await web3.eth.getBalance(accounts[4])
  //   assert(bal4 == startBal + (1e18 * 0.15), 'Should have gained 0.15 eth')

  //   let bal5 = await web3.eth.getBalance(accounts[5])
  //   assert(bal5 == startBal + (1e18 * 0.2), 'Should have gained 0.2 eth')

  //   let bal6 = await web3.eth.getBalance(accounts[6])
  //   assert(bal6 == startBal + (1e18 * 0.5), 'Should have gained 0.5 eth')
  // })

  // it('Set new percentages', async() => {

  //   await Splitter.methods.setPercentages(232, 32, 6342, 15, 2523, 856).send({from: accounts[0], gas:10000000})

  //   await web3.eth.sendTransaction({to: Splitter._address, from: accounts[0], value: web3.utils.toHex(new BigNumber(1e18))})

  //   await Splitter.methods.withdraw().send({from: accounts[0], gas:10000000})

  // })

  // it('Cannot set incorrect percentages', async() => {
  //   try {
  //     await Splitter.methods.setPercentages(23200, 6342, 32, 15, 2523, 856).send({from: accounts[0], gas:10000000})
  //     throw('cannot reach this')
  //   } catch (e) {
  //     assert(e.message.includes('revert'))
  //   }
  // })

  // it('Emergency withdraw', async() => {
  //   await web3.eth.sendTransaction({to: Splitter._address, from: accounts[0], value: web3.utils.toHex(new BigNumber(1e18))})
  //   await Splitter.methods.emergencyWithdraw().send({from: accounts[0], gas:10000000})
  //   let contractBal = await web3.eth.getBalance(Splitter._address)
  //   assert(Number(contractBal) == 0, 'Contract still has eth in it')
  // })

  // it('Admin setting addresses', async() => {
    
  //   await Splitter.methods.setKuya(accounts[7]).send({from: accounts[0], gas:10000000})
  //   await Splitter.methods.setPierre(accounts[7]).send({from: accounts[0], gas:10000000})
  //   await Splitter.methods.setCommunity(accounts[7]).send({from: accounts[0], gas:10000000})
  //   await Splitter.methods.setKyle(accounts[7]).send({from: accounts[0], gas:10000000})
  //   await Splitter.methods.setPerston(accounts[7]).send({from: accounts[0], gas:10000000})
  //   await Splitter.methods.setCoreDevs(accounts[7]).send({from: accounts[0], gas:10000000})
    
  //   let newAddrs = await Splitter.methods.getAddresses().call({from: accounts[0]})
    
  //   assert(newAddrs.kuya == accounts[7], 'Failed to set Kuya')
  //   assert(newAddrs.pierre == accounts[7], 'Failed to set Pierre')
  //   assert(newAddrs.community == accounts[7], 'Failed to set Community')
  //   assert(newAddrs.kyle == accounts[7], 'Failed to set Kyle')
  //   assert(newAddrs.perston == accounts[7], 'Failed to set Perston')
  //   assert(newAddrs.coreDevs == accounts[7], 'Failed to set CoreDevs')

  // })

  // it('User setting address', async() => {

  //   await Splitter.methods.setKuya(accounts[7]).send({from: accounts[1], gas:10000000})
  //   await Splitter.methods.setPierre(accounts[7]).send({from: accounts[2], gas:10000000})
  //   await Splitter.methods.setCommunity(accounts[7]).send({from: accounts[3], gas:10000000})
  //   await Splitter.methods.setKyle(accounts[7]).send({from: accounts[4], gas:10000000})
  //   await Splitter.methods.setPerston(accounts[7]).send({from: accounts[5], gas:10000000})
  //   await Splitter.methods.setCoreDevs(accounts[7]).send({from: accounts[6], gas:10000000})
    
  //   let newAddrs = await Splitter.methods.getAddresses().call({from: accounts[0]})
    
  //   assert(newAddrs.kuya == accounts[7], 'Failed to set Kuya')
  //   assert(newAddrs.pierre == accounts[7], 'Failed to set Pierre')
  //   assert(newAddrs.community == accounts[7], 'Failed to set Community')
  //   assert(newAddrs.kyle == accounts[7], 'Failed to set Kyle')
  //   assert(newAddrs.perston == accounts[7], 'Failed to set Perston')
  //   assert(newAddrs.coreDevs == accounts[7], 'Failed to set CoreDevs')
    
  // })

  // it('External user cannot set addresses', async() => {
  //   try {
  //     await Splitter.methods.setKuya(accounts[7]).send({from: accounts[7], gas:10000000})
  //     throw('cannot reach this')
  //   } catch (e) {
  //     assert(e.message.includes('revert'))
  //   }

  //   try {
  //     await Splitter.methods.setPierre(accounts[7]).send({from: accounts[7], gas:10000000})
  //     throw('cannot reach this')
  //   } catch (e) {
  //     assert(e.message.includes('revert'))
  //   }

  //   try {
  //     await Splitter.methods.setCommunity(accounts[7]).send({from: accounts[7], gas:10000000})
  //     throw('cannot reach this')
  //   } catch (e) {
  //     assert(e.message.includes('revert'))
  //   }

  //   try {
  //     await Splitter.methods.setKyle(accounts[7]).send({from: accounts[7], gas:10000000})
  //     throw('cannot reach this')
  //   } catch (e) {
  //     assert(e.message.includes('revert'))
  //   }

  //   try {
  //     await Splitter.methods.setPerston(accounts[7]).send({from: accounts[7], gas:10000000})
  //     throw('cannot reach this')
  //   } catch (e) {
  //     assert(e.message.includes('revert'))
  //   }

  //   try {
  //     await Splitter.methods.setCoreDevs(accounts[7]).send({from: accounts[7], gas:10000000})
  //     throw('cannot reach this')
  //   } catch (e) {
  //     assert(e.message.includes('revert'))
  //   }

  // })

})