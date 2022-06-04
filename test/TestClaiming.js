const Web3 = require('web3')
const chai = require('chai')
const assert = chai.assert
const BigNumber = require('bignumber.js')
const { time } = require("@openzeppelin/test-helpers");

const ZenStakingSrc = require('../build/contracts/ZenStaking.json')
const ZenApesSrc = require('../build/contracts/ZenApes.json')
const ZenTokenSrc = require('../build/contracts/ZenToken.json')

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
web3.transactionConfirmationBlocks = 1;

const day = 86400

function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

describe('claiming Test', function () {

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
      await ZenApes.methods.ownerMint(accounts[0], 30).send({from: accounts[0], gas: 10000000})
  
      ZenToken = await ZenToken.deploy({data: ZenTokenSrc.bytecode}).send({from: accounts[0], gas: 10000000})
  
      let args = [new BigNumber(1e18), 30 * day, ZenApes.options.address, ZenToken.options.address]
  
      ZenStaking = await ZenStaking.deploy({data: ZenStakingSrc.bytecode, arguments: args}).send({from: accounts[0], gas: 10000000})
  
      await ZenToken.methods.setMinter(ZenStaking.options.address, true).send({from: accounts[0], gas: 10000000})
  
      await ZenApes.methods.setApprovalForAll(ZenStaking.options.address, true).send({from: accounts[0], gas: 10000000})

      await ZenStaking.methods.stakeBatch(range(1, 30)).send({from: accounts[0], gas: 10000000})
    })

    it('should get enough tokens on initial withdraw', async() => {
      await time.increase(35 * day)
      await ZenStaking.methods.claim(1).send({from: accounts[0], gas: 10000000})
      let bal = await ZenToken.methods.balanceOf(accounts[0]).call({from: accounts[0]})
      assert.equal(bal, 5e18)
    })

    it('should get enough tokens on second withdraw', async() => {
      await time.increase(35 * day)
      await ZenStaking.methods.claim(1).send({from: accounts[0], gas: 10000000})

      await time.increase(2 * day)

      await ZenStaking.methods.claim(1).send({from: accounts[0], gas: 10000000})
      let bal = await ZenToken.methods.balanceOf(accounts[0]).call({from: accounts[0]})
      
      assert.equal(bal, 7e18)
    })

    it('should batch claim', async() => {
      await time.increase(35 * day)
      await ZenStaking.methods.batchClaim([1,2,3]).send({from: accounts[0], gas: 10000000})

      let bal = await ZenToken.methods.balanceOf(accounts[0]).call({from: accounts[0]})
      assert.equal(bal, 3 * 5e18)
      
    })

    it('should batch claim 2', async() => {
      await time.increase(35 * day)
      await ZenStaking.methods.claim(1).send({from: accounts[0], gas: 10000000})

      await time.increase(day)
      await ZenStaking.methods.claim(2).send({from: accounts[0], gas: 10000000})

      await time.increase(day)
      await ZenStaking.methods.batchClaim([1,2,3]).send({from: accounts[0], gas: 10000000})

      let bal = await ZenToken.methods.balanceOf(accounts[0]).call({from: accounts[0]})
      assert.equal(bal, 3 * 7e18)
    })
  
  })
