const quais = require('quais')
const QuaiNFT = require('../artifacts/contracts/QuaiNFT.sol/QuaiNFT.json')
require('dotenv').config()

async function verifyContract() {
  console.log('🔍 Verifying contract deployment...')
  
  const contractAddress = process.env.NEXT_PUBLIC_DEPLOYED_CONTRACT
  const rpcUrl = process.env.RPC_URL || 'https://orchard.rpc.quai.network'
  
  console.log(`Contract Address: ${contractAddress}`)
  console.log(`RPC URL: ${rpcUrl}`)
  
  try {
    // Create provider
    const provider = new quais.JsonRpcProvider(rpcUrl, undefined, { usePathing: true })
    
    // Create contract instance
    const contract = new quais.Contract(contractAddress, QuaiNFT.abi, provider)
    
    console.log('\n📋 Testing contract functions...')
    
    // Test basic functions
    try {
      const name = await contract.name()
      console.log(`✅ Name: ${name}`)
    } catch (error) {
      console.log(`❌ Name error: ${error.message}`)
    }
    
    try {
      const symbol = await contract.symbol()
      console.log(`✅ Symbol: ${symbol}`)
    } catch (error) {
      console.log(`❌ Symbol error: ${error.message}`)
    }
    
    try {
      const owner = await contract.owner()
      console.log(`✅ Owner: ${owner}`)
    } catch (error) {
      console.log(`❌ Owner error: ${error.message}`)
    }
    
    try {
      const mintPrice = await contract.mintPrice()
      console.log(`✅ Mint Price: ${mintPrice.toString()} wei`)
    } catch (error) {
      console.log(`❌ Mint Price error: ${error.message}`)
    }
    
    try {
      const supply = await contract.supply()
      console.log(`✅ Supply: ${supply.toString()}`)
    } catch (error) {
      console.log(`❌ Supply error: ${error.message}`)
    }
    
    try {
      const tokenIds = await contract.tokenIds()
      console.log(`✅ Token IDs: ${tokenIds.toString()}`)
    } catch (error) {
      console.log(`❌ Token IDs error: ${error.message}`)
    }
    
    try {
      const baseTokenURI = await contract.baseTokenURI()
      console.log(`✅ Base Token URI: ${baseTokenURI}`)
    } catch (error) {
      console.log(`❌ Base Token URI error: ${error.message}`)
    }
    
    try {
      const maxMintPerAddress = await contract.maxMintPerAddress()
      console.log(`✅ Max Mint Per Address: ${maxMintPerAddress.toString()}`)
    } catch (error) {
      console.log(`❌ Max Mint Per Address error: ${error.message}`)
    }
    
  } catch (error) {
    console.error('❌ Contract verification failed:', error.message)
  }
}

verifyContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
