const quais = require('quais')
const QuaiNFT = require('../artifacts/contracts/QuaiNFT.sol/QuaiNFT.json')
const { deployMetadata } = require("hardhat")
require('dotenv').config()

// Pull contract arguments from environment variables
const tokenArgs = [
  process.env.INITIAL_OWNER,
  process.env.NFT_NAME || "Quai NFT Collection",
  process.env.NFT_SYMBOL || "QNFT",
  process.env.MINT_PRICE || "5000000000000000000", // 5 QUAI in wei
  process.env.MAX_SUPPLY || "1000",
  process.env.BASE_TOKEN_URI || "ipfs://QmZdegfWQ1pR4MEyQff7xnV1J47aLUDAhpR5GjsxrdWtFn/",
  process.env.MAX_MINT_PER_ADDRESS || "5"
]

async function deployERC721() {
  console.log('🚀 Starting QuaiNFT deployment...');
  console.log('📋 Configuration:');
  console.log(`   Collection Name: ${process.env.NFT_NAME || "Quai NFT Collection"}`);
  console.log(`   Symbol: ${process.env.NFT_SYMBOL || "QNFT"}`);
  console.log(`   Mint Price: ${process.env.MINT_PRICE || "5000000000000000000"} wei`);
  console.log(`   Max Supply: ${process.env.MAX_SUPPLY || "1000"}`);
  console.log(`   Max Per Address: ${process.env.MAX_MINT_PER_ADDRESS || "5"}`);
  console.log(`   Base URI: ${process.env.BASE_TOKEN_URI || "ipfs://QmZdegfWQ1pR4MEyQff7xnV1J47aLUDAhpR5GjsxrdWtFn/"}`);
  console.log('');

  try {
    // Get IPFS Hash
    console.log('📤 Uploading metadata to IPFS...');
    const ipfsHash = await deployMetadata.pushMetadataToIPFS("QuaiNFT");
    console.log(`✅ Metadata uploaded to IPFS: ${ipfsHash}`);

    // Config provider, wallet, and contract factory
    console.log('🔧 Setting up provider and wallet...');
    const provider = new quais.JsonRpcProvider(hre.network.config.url, undefined, { usePathing: true });
    const wallet = new quais.Wallet(hre.network.config.accounts[0], provider);
    const ERC721 = new quais.ContractFactory(QuaiNFT.abi, QuaiNFT.bytecode, wallet, ipfsHash);

    // Broadcast deploy transaction
    console.log('📡 Broadcasting deployment transaction...');
    const erc721 = await ERC721.deploy(...tokenArgs);
    console.log('✅ Transaction broadcasted:', erc721.deploymentTransaction().hash);

    // Wait for contract to be deployed
    console.log('⏳ Waiting for deployment confirmation...');
    await erc721.waitForDeployment();
    const contractAddress = await erc721.getAddress();
    
    console.log('');
    console.log('🎉 Deployment successful!');
    console.log('📄 Contract deployed to:', contractAddress);
    console.log('🔗 View on explorer:', `https://orchard.quaiscan.io/address/${contractAddress}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Update your .env file with the contract address:');
    console.log(`   NEXT_PUBLIC_DEPLOYED_CONTRACT=${contractAddress}`);
    console.log('2. Start your frontend application');
    console.log('3. Connect your wallet and start minting!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

deployERC721()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })