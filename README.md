# Quai NFT dApp

A modern, responsive NFT marketplace built on the Quai Network. This dApp allows users to mint, trade, and manage NFTs with a beautiful black and red theme and glass morphism design.

## Features

- 🎨 **Modern UI**: Glass morphism design with black and red theme
- 🔗 **Wallet Integration**: Connect with Pelagus wallet
- 🪙 **NFT Minting**: Mint NFTs with customizable pricing
- 👑 **Owner Controls**: Update supply, pricing, and withdraw funds
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Real-time Updates**: Live contract data and transaction status

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Pelagus Wallet](https://chromewebstore.google.com/detail/pelagus/nhccebmfjcbhghphpclcfdkkekheegop) browser extension
- Git

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mpoletiek/quai-nft-dapp
   cd quai-nft-dapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Environment Setup

1. **Create environment file:**
   ```bash
   cp example.env .env
   ```

2. **Update `.env` with your values:**
   ```env
   # Quai Network Configuration
   RPC_URL=https://orchard.rpc.quai.network
   CHAIN_ID=15000
   
   # Your wallet private key (keep this secure!)
   CYPRUS1_PK=YOUR_PRIVATE_KEY_HERE
   
   # Your wallet address (same as the one derived from private key)
   INITIAL_OWNER=YOUR_WALLET_ADDRESS_HERE
   
   # Contract address (will be set after deployment)
   NEXT_PUBLIC_DEPLOYED_CONTRACT=YOUR_CONTRACT_ADDRESS_HERE
   ```

   **⚠️ Security Note:** Never commit your private key to version control. Keep your `.env` file secure and add it to `.gitignore`.

## Smart Contract Setup

### 1. Compile the Contract

```bash
npx hardhat compile
```

This will compile the `TestERC721.sol` contract and generate the necessary artifacts.

### 2. Deploy the Contract

```bash
npx hardhat run scripts/deployERC721.js
```

### 3. Update Environment Variables

After deployment, copy the contract address and update your `.env` file:

```env
NEXT_PUBLIC_DEPLOYED_CONTRACT=0xYourDeployedContractAddress
```

## Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Connect your wallet:**
   - Click "Connect Wallet" in the dApp
   - Approve the connection

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

The `TestERC721` contract includes:

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

### Network Configuration

The dApp is configured for the Quai Network Cyprus-1 testnet:
- **RPC URL**: `https://orchard.rpc.quai.network`
- **Chain ID**: `15000`
- **Explorer**: `https://orchard.quaiscan.io`

## Development

### Project Structure

```
quai-nft-dapp/
├── contracts/           # Smart contracts
│   └── TestERC721.sol  # Main NFT contract
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   └── utils/          # Utility functions
├── artifacts/          # Compiled contract artifacts
└── hardhat.config.js   # Hardhat configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx hardhat compile` - Compile contracts
- `npx hardhat test` - Run contract tests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

All emojis designed by [OpenMoji](https://openmoji.org) – the open-source emoji and icon project. License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/#)

## Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [Quai Network documentation](https://docs.quai.network/)
3. Open an issue in this repository

---

**Happy minting! 🚀**