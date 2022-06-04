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

    await ZenToken.methods.setMinter(ZenStaking.options.address, true).send({from: accounts[0], gas: 10000000})
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
    await ZenApes.methods.setApprovalForAll(ZenStaking.options.address, true).send({from: accounts[0], gas: 10000000})
    await ZenStaking.methods.stake(1).send({from: accounts[0], gas: 10000000})
    let tokenInfo = await ZenStaking.methods.getTokenInfo(1).call({from: accounts[0]})
    assert.equal(tokenInfo.tokenOwner, accounts[0])
  })


})