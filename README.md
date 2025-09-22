# Quai Network NFT dApp Example

A comprehensive example of how to build an NFT dApp on the Quai Network. This project demonstrates best practices for creating, deploying, and managing NFTs with a modern React frontend and Solidity smart contracts.

## 🎯 What This Example Demonstrates

- **Smart Contract Development**: ERC721 NFT contract with minting, burning, and owner controls
- **Frontend Integration**: React/Next.js dApp with wallet connection and contract interaction
- **Metadata Management**: Automated generation and IPFS integration for NFT metadata
- **Deployment Pipeline**: Complete deployment scripts for Quai Network
- **Modern UI/UX**: Glass morphism design with responsive layout

## ✨ Key Features

### Smart Contract Features
- 🪙 **Public Minting**: Anyone can mint NFTs for a configurable price
- 🔥 **Burn Functionality**: NFT owners can burn their tokens
- 👑 **Owner Controls**: Update supply, pricing, metadata, and withdraw funds
- 📊 **Supply Management**: Configurable maximum supply and mint limits per address
- 🔗 **Automatic Metadata**: Dynamic token URI generation

### Frontend Features
- 🎨 **Modern UI**: Glass morphism design with black and red theme
- 🔗 **Wallet Integration**: Connect with Pelagus wallet
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Real-time Updates**: Live contract data and transaction status
- 🔍 **Token Lookup**: Explore individual token metadata
- 📊 **Portfolio Tracking**: View owned NFTs and minting statistics

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Pelagus Wallet](https://chromewebstore.google.com/detail/pelagus/nhccebmfjcbhghphpclcfdkkekheegop) browser extension
- Git
- QUAI tokens for deployment and testing (get from [Quai Network faucet](https://faucet.quai.network/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mpoletiek/quai-nft-dapp
   cd quai-nft-dapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```
   
   **Note**: The `env.example` file contains all the configuration options you need. Simply copy it to `.env` and update the values for your NFT collection.

### Configuration

Configure your NFT collection by editing the `.env` file:

```env
# Quai Network Configuration
RPC_URL=https://orchard.rpc.quai.network
CHAIN_ID=15000

# Deployment Configuration
CYPRUS1_PK=YOUR_PRIVATE_KEY_HERE
INITIAL_OWNER=YOUR_WALLET_ADDRESS_HERE

# NFT Collection Configuration
NFT_NAME=Your NFT Collection
NFT_SYMBOL=YNC
MINT_PRICE=5000000000000000000  # 5 QUAI in wei
MAX_SUPPLY=1000
BASE_TOKEN_URI=ipfs://YOUR_IPFS_HASH/
MAX_MINT_PER_ADDRESS=5

# Frontend Configuration (set after deployment)
NEXT_PUBLIC_DEPLOYED_CONTRACT=YOUR_CONTRACT_ADDRESS_HERE
```

**⚠️ Security Note:** Never commit your private key to version control. Keep your `.env` file secure and add it to `.gitignore`.

## 📋 Deployment Guide

### Step 1: Prepare Your Assets

1. **Generate NFT metadata:**
   ```bash
   node scripts/generateMetadata.js
   ```

2. **Upload to IPFS:**
   - Upload your `NFTData/images/` and `NFTData/metadata_json/` folders to IPFS
   - Update the IPFS hash in your `.env` file

3. **Update metadata with IPFS hash:**
   ```bash
   node scripts/updateIPFSHash.js
   ```

### Step 2: Deploy Smart Contract

1. **Compile the contract:**
   ```bash
   npx hardhat compile
   ```

2. **Deploy to Quai Network:**
   ```bash
   npx hardhat run scripts/deployERC721.js --network cyprus1
   ```
   
   **Note**: The deployment script will use the configuration from your `.env` file. Make sure all required environment variables are set before deploying.

3. **Verify deployment:**
   ```bash
   node scripts/verifyContract.js
   ```

4. **Update frontend configuration:**
   Copy the deployed contract address to your `.env` file:
   ```env
   NEXT_PUBLIC_DEPLOYED_CONTRACT=0xYourDeployedContractAddress
   ```

### Step 3: Run the Frontend

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Connect your wallet:**
   - Click "Connect Wallet" in the dApp
   - Approve the connection in Pelagus wallet

## Usage

### For Users

1. **Connect Wallet**: Click the "Connect Wallet" button to connect your Pelagus wallet
2. **View Collection**: See the NFT collection details, supply, and pricing
3. **Mint NFTs**: If supply is available, click "Mint NFT" to purchase
4. **View Your NFTs**: Check your owned NFTs in the "Your Stats" section

### For Contract Owners

If you're the contract owner (the address that deployed it), you'll see additional controls:

1. **Withdraw Funds**: Withdraw collected minting fees
2. **Update Supply**: Change the maximum number of NFTs that can be minted
3. **Update Price**: Modify the minting price in QUAI

## Contract Features

The `QuaiNFT` contract includes:

- **Static Base URI**: Tokens get URIs in format `baseURI + tokenId`
- **Owner-Only Controls**: Only the contract owner can update base URI, supply, and pricing
- **Automatic URI Generation**: No need to set individual token URIs
- **Supply Management**: Configurable maximum supply
- **Price Control**: Adjustable minting price

## Troubleshooting

### Common Issues

1. **"Contract address not set" error:**
   - Make sure you've deployed the contract and updated `NEXT_PUBLIC_DEPLOYED_CONTRACT` in `.env`

2. **Wallet connection issues:**
   - Ensure Pelagus wallet is installed and unlocked
   - Check that you're on the correct network (Cyprus-1)

3. **Transaction failures:**
   - Verify you have sufficient QUAI for gas fees
   - Check that the contract has the correct permissions

4. **Build errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Check that your Node.js version is 18 or higher

5. **Contract function errors:**
   - Use `node scripts/verifyContract.js` to test contract functions
   - Check that the contract address is correct in your `.env` file
   - Verify the contract was deployed successfully

### Network Configuration

The dApp is configured for the Quai Network Cyprus-1 testnet:
- **RPC URL**: `https://orchard.rpc.quai.network`
- **Chain ID**: `15000`
- **Explorer**: `https://orchard.quaiscan.io`

## Development

## 📁 Project Structure

```
quai-nft-dapp/
├── contracts/              # Smart contracts
│   └── QuaiNFT.sol        # Main NFT contract
├── src/                   # Frontend source code
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── utils/             # Utility functions
├── scripts/               # Deployment and utility scripts
│   ├── deployERC721.js    # Contract deployment script
│   ├── generateMetadata.js # NFT metadata generation
│   ├── updateIPFSHash.js  # IPFS hash update utility
│   └── verifyContract.js  # Contract verification script
├── NFTData/               # NFT assets and metadata
│   ├── images/            # NFT images
│   ├── metadata_json/     # Generated metadata files
│   ├── json_template.json # Metadata template
│   └── README.md          # NFT data documentation
├── src/utils/             # Utility functions and constants
│   ├── constants.ts       # Application constants
│   ├── quaisUtils.ts      # Quai Network utilities
│   └── wallet/            # Wallet integration utilities
├── artifacts/             # Compiled contract artifacts
├── env.example            # Environment variables template
└── hardhat.config.js      # Hardhat configuration
```

## 🛠️ Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Smart Contract Scripts
- `npx hardhat compile` - Compile contracts
- `npx hardhat test` - Run contract tests
- `npx hardhat run scripts/deployERC721.js` - Deploy contract

### Utility Scripts
- `node scripts/generateMetadata.js` - Generate NFT metadata
- `node scripts/updateIPFSHash.js` - Update IPFS hashes in metadata
- `node scripts/verifyContract.js` - Verify contract deployment and functions

## 🎨 Customization Guide

### Customizing Your NFT Collection

1. **Replace Assets:**
   - Replace emoji files in the `emojis/` directory with your own images
   - Update the metadata template in `NFTData/json_template.json`

2. **Modify Smart Contract:**
   - Edit `contracts/QuaiNFT.sol` to add custom functionality
   - Update constructor parameters for different collection settings

3. **Customize Frontend:**
   - Modify components in `src/components/` for different UI/UX
   - Update styling in `src/app/globals.css`

4. **Configuration Options:**
   - Use `env.example` as a template for your environment variables
   - Set environment variables for different deployment environments
   - Modify `src/utils/constants.ts` for application constants

### Best Practices

- **Security**: Never commit private keys or sensitive data
- **Testing**: Test thoroughly on testnet before mainnet deployment
- **Gas Optimization**: Consider gas costs when setting mint prices
- **Metadata**: Ensure IPFS links are permanent and accessible
- **User Experience**: Provide clear error messages and loading states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Attributions

- **Emoji Assets**: [OpenMoji](https://openmoji.org) - CC BY-SA 4.0 License
- **Smart Contracts**: [OpenZeppelin](https://openzeppelin.com/contracts/) - MIT License  
- **Blockchain Network**: [Quai Network](https://quai.network/)

## Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [Quai Network documentation](https://docs.quai.network/)
3. Open an issue in this repository

---

**Happy minting! 🚀**