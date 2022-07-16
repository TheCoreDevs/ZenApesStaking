const Web3 = require('web3')
const chai = require('chai')
const assert = chai.assert
const BigNumber = require('bignumber.js')

const ZenStakingSrc = require('../build/contracts/ZenStakingV1.json')
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

    await ZenToken.methods.setMinter(ZenStaking.options.address, true).send({from: accounts[0], gas: 10000000})

    await ZenApes.methods.setApprovalForAll(ZenStaking.options.address, true).send({from: accounts[0], gas: 10000000})
  })

  it('First account should have 10 Zen Apes', async() => {
    let ZenApesBal = await ZenApes.methods.balanceOf(accounts[0]).call({from: accounts[0]})
    assert.equal(ZenApesBal, 10)
  })

  it('All params are set correctly', async() => {
    let addresses = await ZenStaking.methods.getContractAddresses().call({from: accounts[0]})
    assert.equal(addresses.zenApes, ZenApes.options.address)
    assert.equal(addresses.zenToken, ZenToken.options.address)

    let stakingSettings = await ZenStaking.methods.getStakingSettings().call({from: accounts[0]})
    assert.equal(stakingSettings[0], new BigNumber(1e18)) // yield per day
    assert.equal(stakingSettings[1], 20) // required stake time
  })

  it('can stake single', async() => {
    await ZenStaking.methods.stake(1).send({from: accounts[0], gas: 1000000}) //////////////////////
    let tokenInfo = await ZenStaking.methods.getTokenInfo(1).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])

    let newOwner = await ZenApes.methods.ownerOf(1).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)
  })

  it('can batch stake', async() => {
    await ZenStaking.methods.stakeBatch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).send({from: accounts[0], gas: 1000000})//////////////////// 
    
    let tokenInfo
    let newOwner
    tokenInfo = await ZenStaking.methods.getTokenInfo(1).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(1).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(2).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(2).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(3).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(3).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(4).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(4).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)
    
    tokenInfo = await ZenStaking.methods.getTokenInfo(5).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(5).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(6).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(6).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(7).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(7).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(8).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(8).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(9).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(9).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(10).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
    newOwner = await ZenApes.methods.ownerOf(10).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)
  })

  it('can unstake', async() => {
    let oldOwner = await ZenApes.methods.ownerOf(1).call({from: accounts[0]})

    await ZenStaking.methods.stake(1).send({from: accounts[0], gas: 1000000})
    await ZenStaking.methods.unstake(1).send({from: accounts[0], gas: 1000000}) /////////////

    let newOwner = await ZenApes.methods.ownerOf(1).call({from: accounts[0]})
    assert.equal(oldOwner, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(1).call({from: accounts[0]})
    assert.equal(tokenInfo.stakingTimestamp, 0)
  })

  it('can batch unstake', async() => {
    let oldOwner = await ZenApes.methods.ownerOf(1).call({from: accounts[0]})

    await ZenStaking.methods.stakeBatch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).send({from: accounts[0], gas: 1000000}) // 439591
    // await ZenStaking.methods.unstake(1).send({from: accounts[0], gas: 10000000})
    await ZenStaking.methods.unstakeBatch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).send({from: accounts[0], gas: 300000}) ///////////////

    let newOwner = await ZenApes.methods.ownerOf(2).call({from: accounts[0]})
    assert.equal(oldOwner, newOwner)

    tokenInfo = await ZenStaking.methods.getTokenInfo(10).call({from: accounts[0]})
    assert.equal(tokenInfo.stakingTimestamp, 0)
  })

  it('can stake again', async() => {
    await ZenStaking.methods.stake(1).send({from: accounts[0], gas: 10000000})
    await ZenStaking.methods.unstake(1).send({from: accounts[0], gas: 10000000})
    await ZenStaking.methods.stake(1).send({from: accounts[0], gas: 10000000})

    let tokenInfo = await ZenStaking.methods.getTokenInfo(1).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])

    let newOwner = await ZenApes.methods.ownerOf(1).call({from: accounts[0]})
    assert.equal(ZenStaking.options.address, newOwner)
  })

  it('can change addresses and settings', async() => {
    await ZenStaking.methods.setYieldPerDay(new BigNumber(5e18)).send({from: accounts[0], gas: 10000000})
    await ZenStaking.methods.setRequiredStakeTime(100).send({from: accounts[0], gas: 10000000})
    await ZenStaking.methods.setZenTokenContractAddr(ZenStaking.options.address).send({from: accounts[0], gas: 10000000})
    await ZenStaking.methods.setZenApesContractAddr(ZenStaking.options.address).send({from: accounts[0], gas: 10000000})

    let addresses = await ZenStaking.methods.getContractAddresses().call({from: accounts[0]})
    assert.equal(addresses.zenApes, ZenStaking.options.address)
    assert.equal(addresses.zenToken, ZenStaking.options.address)

    let stakingSettings = await ZenStaking.methods.getStakingSettings().call({from: accounts[0]})
    assert.equal(stakingSettings[0], new BigNumber(5e18)) // yield per day
    assert.equal(stakingSettings[1], 100) // required stake time
  })

  it('disallow non contract addressese to be set', async() => {
    // await ZenStaking.methods.setZenTokenContractAddr(accounts[0]).send({from: accounts[0], gas: 10000000})
    try {
      await ZenStaking.methods.setZenApesContractAddr(accounts[0]).send({from: accounts[0], gas: 10000000})
      throw('cannot reach this')
    } catch (e) {
      assert(e.message.includes('revert'))
    }

    try {
      await ZenStaking.methods.setZenTokenContractAddr(accounts[0]).send({from: accounts[0], gas: 10000000})
      throw('cannot reach this')
    } catch (e) {
      assert(e.message.includes('revert'))
    }
  })

  it('disallow non owner to stake', async() => {
    
    try {
      await ZenStaking.methods.stake(1).send({from: accounts[1], gas: 10000000})
      throw('cannot reach this')
    } catch (e) {
      assert(e.message.includes('revert'))
    }

    try {
      await ZenStaking.methods.stakeBatch([2, 3, 4, 5]).send({from: accounts[1], gas: 10000000})
      throw('cannot reach this')
    } catch (e) {
      assert(e.message.includes('revert'))
    }
  })

  it('disallow non owner to unstake', async() => {
    await ZenStaking.methods.stake(1).send({from: accounts[0], gas: 10000000})

    try {
      await ZenStaking.methods.unstake(1).send({from: accounts[1], gas: 10000000})
      throw('cannot reach this')
    } catch (e) {
      assert(e.message.includes('revert'))
    }

    await ZenStaking.methods.stakeBatch([2, 3, 4, 5]).send({from: accounts[0], gas: 10000000})

    try {
      await ZenStaking.methods.unstakeBatch([2, 3, 4, 5]).send({from: accounts[1], gas: 10000000})
      throw('cannot reach this')
    } catch (e) {
      assert(e.message.includes('revert'))
    }
  })

  it('contract owner can unstake batch', async() => {
    
    await ZenApes.methods.transferFrom(accounts[0], accounts[1], 1).send({from: accounts[0], gas: 1000000})
    let oldOwner1 = await ZenApes.methods.ownerOf(1).call({from: accounts[0]})
    await ZenApes.methods.setApprovalForAll(ZenStaking.options.address, true).send({from: accounts[1], gas: 10000000})
    await ZenStaking.methods.stake(1).send({from: accounts[1], gas: 1000000})


    await ZenApes.methods.transferFrom(accounts[0], accounts[2], 2).send({from: accounts[0], gas: 1000000})
    let oldOwner2 = await ZenApes.methods.ownerOf(2).call({from: accounts[0]})
    await ZenApes.methods.setApprovalForAll(ZenStaking.options.address, true).send({from: accounts[2], gas: 10000000})
    await ZenStaking.methods.stake(2).send({from: accounts[2], gas: 1000000})

    await ZenApes.methods.transferFrom(accounts[0], accounts[3], 3).send({from: accounts[0], gas: 1000000})
    let oldOwner3 = await ZenApes.methods.ownerOf(3).call({from: accounts[0]})
    await ZenApes.methods.setApprovalForAll(ZenStaking.options.address, true).send({from: accounts[3], gas: 10000000})
    await ZenStaking.methods.stake(3).send({from: accounts[3], gas: 1000000})

    await ZenStaking.methods.ownerUnstakeBatch([1, 2, 3]).send({from: accounts[0], gas: 1000000})

    let newOwner1 = await ZenApes.methods.ownerOf(1).call({from: accounts[0]})
    assert.equal(oldOwner1, newOwner1)
    let newOwner2 = await ZenApes.methods.ownerOf(2).call({from: accounts[0]})
    assert.equal(oldOwner2, newOwner2)
    let newOwner3 = await ZenApes.methods.ownerOf(3).call({from: accounts[0]})
    assert.equal(oldOwner3, newOwner3)

    // assert(ids == info.tokenIds, "arrays don't match")
  })

  it('can get user token info', async() => {

    let ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    // ids = [1, 2]
    await ZenStaking.methods.stakeBatch(ids).send({from: accounts[0], gas: 1000000})

    // await ZenStaking.methods.getUserTokenInfo(accounts[0]).call({from: accounts[0]})
    let info = await ZenStaking.methods.getUserTokenInfo(accounts[0]).call({from: accounts[0]})
    console.log(info)

    assert(ids == info.tokenIds, "arrays don't match")
  })



})