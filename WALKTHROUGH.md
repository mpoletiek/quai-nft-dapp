# Building an NFT dApp on QUAI
Today we’re going to be building an NFT dApp on QUAI complete with a web interface for interacting with it and managing some of the properties like mint price and total supply. 

To have the best experience when following this guide I recommend you use the Chrome browser on either MacOS or Linux. Additionally, download and install VSCode if you don’t already have it as we’ll be working both in the terminal and editing code directly in order to build this app. Lastly, we'll be building our webapp using Node.js so it will be important to have that installed and setup ahead of time.

# Get a Quai Wallet with Funds

In order to build this app you will need to have a wallet with some funds in it.

You can get the Pelagus wallet at [pelaguswallet.io](https://pelaguswallet.io) and acquire some testnet Quai from [faucet.quai.network](https://faucet.quai.network). 

## Setup The Development Environment

Let’s make a directory for our development work.

`mkdir ~/Devspace && cd ~/Devspace`

Now let’s initialize our new Next.js app. Run the following command which asks you a few questions. You can use the values below.

`npx create-next-app@latest`

Building and Deploying the NFT Smart Contract
Once the Next.js app is created we can open the `quai-nft-dapp` folder in VSCode and run a new terminal.

For building and deploying the NFT smart contract on Quai, we’ll use the official [hardhat-example](https://github.com/dominant-strategies/hardhat-example) repo provided by Dominant Strategies (the development team behind Quai) as a reference.

The reference repo on github has examples for both regular (single chain) solidity and SolidityX, which is a port of Solidity that support cross-chain transactions, an innovation that’s unique to Quai. To keep things simple we’ll ignore SolidityX for this tutorial. 

You can follow along by referencing the [Solidity folder](https://github.com/dominant-strategies/hardhat-example/tree/main/Solidity) in the hardhat-example repo.

## Install Dependencies
In order to build and deploy our smart contract we’ll need a few more dependencies. 

First we’ll install `@openzeppelin/contracts` which provides helper functions for building standard ERC721 (NFT) smart contracts.

`npm i @openzeppelin/contracts`

Next we’ll install `dotenv` which will allow us to configure our app via environment variables.

`npm i dotenv`

Additionally, we’ll leverage hardhat for compiling and deploying our smart contracts.

`npm i hardhat`
`npm i --save-dev @nomicfoundation/hardhat-toolbox`

Lastly we’ll install quais.js which is the ethers-like SDK for building on Quai Network.

`npm i quais`

## Initialize & Setup Hardhat
To initialize our new hardhat project we will run the following, selecting defaults when asked. 

`npx hardhat init`

This command creates a basic folder structure for hardhat and a few examples for us. 

We will need to configure hardhat to deploy our smart contract using `.env.local` environment variables. 

In the root folder find `hardhat.config.js` and replace it with the following:

```
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomicfoundation/hardhat-toolbox')
const dotenv = require('dotenv')
dotenv.config({ path: './.env.local' })

module.exports = {
  defaultNetwork: 'cyprus1',
  networks: {
	cyprus1: {
  	url: process.env.RPC_URL,
  	accounts: [process.env.CYPRUS1_PK],
  	chainId: Number(process.env.CHAIN_ID),
	},
  },

  solidity: {
	version: '0.8.20',
	settings: {
  	optimizer: {
    	enabled: true,
    	runs: 1000,
  	},
  	evmVersion: 'london',
	},
  },

  paths: {
	sources: './contracts',
	cache: './cache',
	artifacts: './artifacts',
  },
  mocha: {
	timeout: 20000,
  },
}
```

Be sure to save your changes. This will inform hardhat what it needs to know about Quai network in order to deploy our contract later. It depends on some environment variables which we will setup next.

In the root of our folder structure in VSCode create a `.env.local` file and populate it with the correct information. 

```
## Sample environment file - change all values as needed

# Unique privkey for each deployment address
CYPRUS1_PK="0x0000000000000000000000000000000000000000000000000000000000000000"
INITIAL_OWNER="0x0000000000000000000000000"

# Chain ID (local: 1337, testnet: 9000, devnet: 12000)
CHAIN_ID="9000"

# RPC endpoint
RPC_URL="https://rpc.quai.network"
```

Replace the values for `CYPRUS1_PK` and `INITIAL_OWNER` with your Quai wallet’s private key and public key respectively. If you’re using Pelagus you can copy your public key and replace `INITIAL_OWNER`. You’ll have to export your private key and replace `CYPRUS1_PK` with it. 

Next we’ll need to create the script for deploying our contract. 

Create folder in the root directory called `scripts` and make a file inside it called `deployERC721.js`. Populate `deployERC721.js` with the following.

```
const quais = require('quais')
const TestNFT = require('../artifacts/contracts/ERC721.sol/TestERC721.json')
require('dotenv').config()

// Pull contract arguments from .env
const tokenArgs = [process.env.INITIAL_OWNER]

async function deployERC721() {
  // Config provider, wallet, and contract factory
  const provider = new quais.JsonRpcProvider(hre.network.config.url, undefined, { usePathing: true })
  const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
  const ERC721 = new quais.ContractFactory(TestNFT.abi, TestNFT.bytecode, wallet)

  // Broadcast deploy transaction
  const erc721 = await ERC721.deploy(...tokenArgs)
  console.log('Transaction broadcasted: ', erc721.deploymentTransaction().hash)

  // Wait for contract to be deployed
  await erc721.waitForDeployment()
  console.log('Contract deployed to: ', await erc721.getAddress())
}

deployERC721()
  .then(() => process.exit(0))
  .catch((error) => {
	console.error(error)
	process.exit(1)
  })
```

This is the script we’ll call later to deploy our smart contract. 

While we’re here, let’s delete the `Lock.sol` file under the `contracts/` folder to prevent hardhat from bringing it in when we want to compile. 

## Write the smart contract
In the `contracts` folder we’re going to create an `ERC721.sol` file and populate it with the following:

```
// Quai NFT Example //
/////////////////////
// Anyone can mint.
// Max supply and mint price are public, modifiable by the owner.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract TestERC721 is ERC721URIStorage, Ownable {
	uint256 public tokenIds = 0;
	uint256 public mintPrice = (5 ether);
	uint256 public supply = 10000;
    
	constructor(address initialOwner) Ownable(initialOwner) ERC721("TestERC721", "TNFT") { }

	// Mint NFT
	function mint(address _recipient, string memory _tokenURI)
    	public
    	payable
    	returns (uint256)
	{
    	require(msg.value == mintPrice, "5 QUAI to Mint");
    	uint256 tokenId = tokenIds;
    	require(tokenId < supply, "No more NFTs");
    	_mint(_recipient, tokenId);
    	_setTokenURI(tokenId, _tokenURI);
    	tokenIds += 1;
    	return tokenId;
	}

	// Burn NFT
	function burn(uint256 tokenId) external {
    	require(ownerOf(tokenId) == msg.sender, "Only the owner of the NFT can burn it.");
    	_burn(tokenId);
	}

   
	// Update token supply
	function updateSupply(uint256 _supply)
    	public
    	onlyOwner()
    	returns (uint256)
	{
    	require(_supply > tokenIds, "New supply must be greater than current minted supply.");
    	supply = _supply;
    	return supply;
	}

	// Update Mint Price
	function updateMintPrice(uint256 _price)
    	public
    	onlyOwner()
    	returns (uint256)
	{
    	mintPrice = _price;
    	return mintPrice;
	}
    
	// Withdraw QUAI to Owner
	function withdraw()
    	public
    	payable
    	onlyOwner()
    	returns (bool)
	{
    	require(msg.sender == owner(), "Unauthorized");
    	(bool success, ) = owner().call{value:address(this).balance}("");
    	require(success, "Withdraw failed.");
    	return true;
	}

}
```

This contract has 3 public variables; tokenIds, mintPrice, and supply, which will be modifiable by the contract owner or `INITIAL_OWNER` once the contract is deployed. The initial tokenId is 0, mintPrice is 5 Quai, and total supply is 10,000.

The name and symbol of the NFT contract is hardcoded into the Solidity code as “TestERC721” and “TNFT”.

There are functions only available to the contract owner which allows them to update mintPrice and supply. Additionally, as NFTs are minted, the balance of the contract grows. We provide the `withdraw` function for the owner to withdraw these funds from the contract as well. 

## Compile and Deploy the Smart Contract
Once this is all complete we can go ahead and compile our smart contract.
`npx hardhat compile`

If everything was configured correctly we can run our `deployERC721.js` script to launch our smart contract on Quai:

`npx hardhat run scripts/deployERC721.js`

The first thing this script does is broadcast a transaction on the Quai network. We will have to wait for the transaction to be mined to receive a result, but we can monitor the transaction hash on [quaiscan.io](https://quaiscan.io).

Just search the hash presented on Quaiscan. Once it’s successful the script will return our contract address. 

Take note of this contract address. We will need it later to build the app to interact with it. Save it in `.env.local` as `NEXT_PUBLIC_DEPLOYED_CONTRACT`

You can also inspect the details of this contract by searching the address on [quaiscan.io](https://quaiscan.io).

## Building the dApp

Now that we have an NFT contract on the Quai blockchain we’ll want to build a web interface that can interact with it. 

First, let’s install another dependency to help our user interface look decent and allow for some tasty toast notifications when the user interacts with the smart contract. The second command will ask you if you want to install the chakra cli. Press enter to go ahead and proceed.

`npm i @chakra-ui/react`
`npx @chakra-ui/cli snippet add toaster`

We will be building this app in the `src` folder in our project. Create the following files with the following code in order to get started. 

In `src/app/` we’ll need a `providers.tsx` file and a `store.tsx` file. We’ll be using these to manage the wallet state across the app. 

### src/app/store.tsx

```
/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client';

import React, { FC, createContext, useReducer, ReactNode } from 'react';

interface StateData {
  account: account;
  web3Provider: any | undefined;
  rpcProvider: any | undefined;
  activeButton: string;
}

const typeStateMap = {
  SET_ACCOUNT: 'account',
  SET_WEB3_PROVIDER: 'web3Provider',
  SET_RPC_PROVIDER: 'rpcProvider',
  SET_ACTIVE_BUTTON: 'activeButton',
};

const initialState: StateData = {
  account: undefined,
  web3Provider: undefined,
  rpcProvider: undefined,
  activeButton: 'Home',
};

const reducer = (state: StateData, action: { type: keyof typeof typeStateMap; payload: any }) => {
  const stateName = typeStateMap[action.type];
  if (!stateName) {
	console.warn(`Unknown action type: ${action.type}`);
	return state;
  }
  return { ...state, [stateName]: action.payload };
};

const StateContext = createContext(initialState);
const DispatchContext = createContext<any>(null);

const StateProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
	<DispatchContext.Provider value={dispatch}>
  	<StateContext.Provider value={state}>{children}</StateContext.Provider>
	</DispatchContext.Provider>
  );
};

export { typeStateMap, StateContext, DispatchContext, StateProvider };
```

### src/app/providers.tsx
```
'use client';
import { StateProvider } from '@/app/store';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
	<>
  	<ChakraProvider value={defaultSystem}>
    	<StateProvider>
        	{children}
    	</StateProvider>
  	</ChakraProvider>
	</>
  );
}
```

To help our app, which uses Typescript, understand a few more details we’ll add some additional types in `src/app/additional.d.ts`

### src/app/additional.d.ts
```
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { AbstractProvider, Eip1193Provider } from 'quais';

declare global {
  interface Window {
	pelagus?: Eip1193Provider & AbstractProvider;
  }
 
  // ---- data types ---- //
  type provider = { web3: any | undefined; rpc: any | undefined };
  type account = { addr: string; shard: string } | undefined;
  type ShardNames = {
	[key: string]: { name: string; rpcName: string };
  };
  type CodingLanguage = {
	[key: string]: { icon: any; color: string };
  };

 
}
```

We define some utilities for the app to interact with the user's wallet in the following files. You might need to create a few folders along the way.

### src/components/utils.ts
```
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { quais } from 'quais';

// ---- formatting ---- //
export const shortenAddress = (address: string) => {
  if (address === '') return '';
  return address.slice(0, 5) + '...' + address.slice(-4);
};

export const sortedQuaiShardNames: ShardNames = {
  '0x00': { name: 'Cyprus-1', rpcName: 'cyprus1' },
};

// ---- explorer url builders ---- //
export const buildRpcUrl = () => {
  return `http://rpc.quai.network`;
};

export const buildExplorerUrl = () => {
  return `https://quaiscan.io`;
};

export const buildAddressUrl = (address: string) => {
  return `https://quaiscan.io/address/${address}`;
};

export const buildTransactionUrl = (txHash: string) => {
  return `https://quaiscan.io/tx/${txHash}`;
};

// ---- dispatchers ---- //
export const dispatchAccount = (accounts: Array<string> | undefined, dispatch: any) => {
  if (accounts?.length !== 0 && accounts !== undefined) {
	const shard = quais.getZoneForAddress(accounts[0]);
	if (shard === null) {
  	dispatch({ type: 'SET_RPC_PROVIDER', payload: undefined });
  	dispatch({ type: 'SET_ACCOUNT', payload: undefined });
  	return;
	}
	const account = {
  	addr: accounts[0],
  	shard: shard,
	};
	const rpcProvider = new quais.JsonRpcProvider(buildRpcUrl());
	dispatch({ type: 'SET_RPC_PROVIDER', payload: rpcProvider });
	dispatch({ type: 'SET_ACCOUNT', payload: account });
  } else {
	dispatch({ type: 'SET_RPC_PROVIDER', payload: undefined });
	dispatch({ type: 'SET_ACCOUNT', payload: undefined });
  }
};

// ---- data validation ---- //

export const validateAddress = (address: string) => {
  if (address === '') return false;
  return quais.isAddress(address);
};
```

### src/components/wallet/requestAccounts.ts
```
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { dispatchAccount } from '@/components/utils';

// ---- request accounts ---- //
// only called on user action, prompts user to connect their wallet
// gets user accounts and provider if user connects their wallet

const requestAccounts = async (dispatch: any, web3provider: any) => {
  if (!web3provider) {
	console.log('No pelagus provider found.');
	return;
  }
  await web3provider
	.send('quai_requestAccounts')
	.then((accounts: Array<string>) => {
  	console.log('Accounts returned: ', accounts);
  	dispatchAccount(accounts, dispatch);
	})
	.catch((err: Error) => {
  	console.log('Error getting accounts.', err);
	});
};

export default requestAccounts;
```

### src/components/wallet/useGetAccounts.ts
```
/* eslint-disable  @typescript-eslint/no-unused-vars */
/* eslint-disable  @typescript-eslint/no-explicit-any */


'use client';

import { useEffect, useContext } from 'react';
import { quais } from 'quais';

import { DispatchContext } from '@/app/store';
import { dispatchAccount } from '@/components/utils';

// ---- get accounts ---- //
// called in background on page load, gets user accounts and provider if pelagus is connected
// sets up accountsChanged listener to handle account changes

const useGetAccounts = () => {
  const dispatch = useContext(DispatchContext);
  useEffect(() => {
	const getAccounts = async (provider: any, accounts?: Array<string> | undefined) => {
  	let account;
  	await provider
    	.send('quai_accounts')
    	.then((accounts: Array<string>) => {
      	account = dispatchAccount(accounts, dispatch);
    	})
    	.catch((err: Error) => {
      	console.log('Error getting accounts.', err);
    	});
  	return account;
	};

	if (!window.pelagus) {
  	dispatch({ type: 'SET_WEB3_PROVIDER', payload: undefined });
  	return;
	} else {
  	const web3provider = new quais.BrowserProvider(window.pelagus);
  	dispatch({ type: 'SET_WEB3_PROVIDER', payload: web3provider });
  	getAccounts(web3provider);
  	window.pelagus.on('accountsChanged', (accounts: Array<string> | undefined) =>
    	dispatchAccount(accounts, dispatch)
  	);
	}
	// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useGetAccounts;
```

### src/components/wallet/index.ts
```
export { default as requestAccounts } from './requestAccounts';
export { default as useGetAccounts } from './useGetAccounts';
```

Finally we can start building out our app's main page.

### src/app/layout.tsx
```
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quai NFT dApp",
  description: "An example NFT dApp on Quai",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
	<html lang="en">
  	<body
    	className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  	>
    	<Providers>
      	{children}
    	</Providers>
   	 
  	</body>
	</html>
  );
}
```

### src/app/connectButton.tsx
```
'use client';

import { useContext } from 'react';
import { StateContext, DispatchContext } from '@/app/store';
import { requestAccounts } from '@/components/wallet';

const ConnectButton = () => {
  const { web3Provider } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const connectHandler = () => {
	requestAccounts(dispatch, web3Provider);
  };

  if (!web3Provider) {
	return (
  	<a
    	className="w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-red-700 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-red-700 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
    	href="https://chromewebstore.google.com/detail/pelagus/nhccebmfjcbhghphpclcfdkkekheegop"
    	target="_blank"
  	>
    	<span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
      	Install Pelagus Wallet
    	</span>
  	</a>
	);
  } else {
	return (
    	<button
      	className="w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-red-700 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-red-700 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
      	onClick={connectHandler}>
        	<span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          	Connect Wallet
        	</span>
    	</button>
	);
  }
};

export default ConnectButton;
```

### src/app/page.tsx
```
/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client'
import {useState,useEffect} from 'react'
import { useContext } from 'react';
import { Toaster, toaster } from "@/components/ui/toaster"
import { buildTransactionUrl, shortenAddress, sortedQuaiShardNames } from '@/components/utils';
import { quais } from 'quais';
import TestNFT from '../../artifacts/contracts/ERC721.sol/TestERC721.json';
import { StateContext } from '@/app/store';
import ConnectButton from './connectButton';
import { useGetAccounts } from '@/components/wallet';

export default function Mint() {
  useGetAccounts();
  const [nftName, setNFTName] = useState('NFT Name');
  const [symbol, setSymbol] = useState('NFT Symbol');
  const [isOwner, setIsOwner] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  const [newSupply, setNewSupply] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [nftBalance, setNFTBalance] = useState(0);
  const [mintPrice, setMintPrice] = useState(BigInt(0));
  const [tokenSupply, setTokenSupply] = useState(null);
  const [remainingSupply, setRemainingSupply] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const { web3Provider, account } = useContext(StateContext);
  const contractAddress = process.env.NEXT_PUBLIC_DEPLOYED_CONTRACT as string; // Change this to your contract address
  const tokenuri = "https://example.com";

  const getContractBalance = async () => {
	const resp = await fetch('https://quaiscan.io/api/v2/addresses/'+contractAddress);
	const ret = await resp.json();
	if(ret.coin_balance){
  	setContractBalance(Number(ret.coin_balance)/Number(1000000000000000000));
  	console.log("Contract Balance: "+contractBalance);
	}
  }

  const callContract = async (type: string) => {
	if(type == 'balanceOf') {
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const balance = await ERC721contract.balanceOf(account?.addr);
  	if(balance){
    	console.log("Balance: "+balance);
    	setNFTBalance(balance);
  	}
  	return balance;
	}
	else if(type == 'symbol'){
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const contractSymbol = await ERC721contract.symbol();
  	if(contractSymbol){
    	setSymbol(contractSymbol);
  	}
  	return contractSymbol;
	}
	else if(type == 'name'){
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const contractName = await ERC721contract.name();
  	if(contractName){
    	setNFTName(contractName);
  	}
  	return contractName;
	}
	else if(type == 'owner'){
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const contractOwner = await ERC721contract.owner();
  	if(account?.addr == contractOwner){
    	setIsOwner(true);
  	}
  	return contractOwner;
	}
	else if(type == 'mintPrice'){
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const price = await ERC721contract.mintPrice();
  	if(price){
    	console.log('mintPrice: '+(price/BigInt(1000000000000000000)));
    	setMintPrice(price/BigInt(1000000000000000000));
  	}
  	return price;
	}
	else if(type == 'tokenid'){
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const tokenid = await ERC721contract.tokenIds();
  	if(tokenid >= 0){
    	console.log("tokenid: "+tokenid);
    	setTokenId(tokenid);
  	}
	}
	else if(type == 'supply'){
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const supply = await ERC721contract.supply();
  	if(supply){
    	console.log("supply: "+supply);
    	setTokenSupply(supply);
  	}
  	return supply;
	}
	else if(type == 'mint'){
  	try {
    	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
    	const price = await ERC721contract.mintPrice();
    	const contractTransaction = await ERC721contract.mint(account?.addr,tokenuri,{value: price});
    	const txReceipt = await contractTransaction.wait();
    	return Promise.resolve({ result: txReceipt, method: "Mint" });
  	} catch (err) {
    	return Promise.reject(err);
  	}
	}
	else if(type == 'withdraw'){
  	try {
    	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
    	const contractTransaction = await ERC721contract.withdraw();
    	const txReceipt = await contractTransaction.wait();
    	console.log(txReceipt);
    	return Promise.resolve({ result: txReceipt, method: "Withdraw" });
  	} catch (err) {
    	return Promise.reject(err);
  	}
	}
	else if(type=='updateSupply'){
  	try {
    	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
    	if(newSupply > 0){
      	console.log("New Supply Value: "+newSupply);
      	const contractTransaction = await ERC721contract.updateSupply(newSupply);
      	const txReceipt = await contractTransaction.wait();
      	console.log(txReceipt);
      	return Promise.resolve({ result: txReceipt, method: "updateSupply" });
    	}
  	} catch (err) {
    	return Promise.reject(err);
  	}
	}
	else if(type=='updatePrice'){
  	try {
    	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
    	if(newPrice > 0){
      	const priceQuai = quais.parseQuai(String(newPrice));
      	console.log("New Price Value: "+priceQuai);
      	const contractTransaction = await ERC721contract.updateMintPrice(priceQuai);
      	const txReceipt = await contractTransaction.wait();
      	console.log(txReceipt);
      	return Promise.resolve({ result: txReceipt, method: "updateMintPrice" });
    	}
  	} catch (err) {
    	return Promise.reject(err);
  	}
	}
  };

  // HANDLE UPDATE PRICE
  const handleUpdatePrice = async () =>{
	toaster.promise(
  	callContract('updatePrice'),
  	{
    	loading: {
      	title: 'Broadcasting Transaction',
      	description: '',
    	},
    	success: ({result, method}) =>(
      	{
      	title: 'Transaction Successful',
      	description: (
        	<>
          	{result.hash ? (
            	<a
              	className="underline"
              	href={buildTransactionUrl(result.hash)}
              	target="_blank"
            	>
              	View In Explorer
            	</a>
          	) : (
            	<p>
              	{method} : {result}
            	</p>
          	)}
        	</>
      	),
      	duration: 10000,
    	}),
    	error: (error: any) => ({
      	title: 'Error',
      	description: error.reason || error.message || 'An unknown error occurred',
      	duration: 10000,
    	}),
  	}
	);
  }

  // HANDLE UPDATE SUPPLY
  const handleUpdateSupply = async () =>{
	toaster.promise(
  	callContract('updateSupply'),
  	{
    	loading: {
      	title: 'Broadcasting Transaction',
      	description: '',
    	},
    	success: ({result, method}) => (
      	{
      	title: 'Transaction Successful',
      	description: (
        	<>
          	{result.hash ? (
            	<a
              	className="underline"
              	href={buildTransactionUrl(result.hash)}
              	target="_blank"
            	>
              	View In Explorer
            	</a>
          	) : (
            	<p>
              	{method} : {result}
            	</p>
          	)}
        	</>
      	),
      	duration: 10000,
    	}),
    	error: (error: any) => ({
      	title: 'Error',
      	description: error.reason || error.message || 'An unknown error occurred',
      	duration: 10000,
    	}),
  	}
	);
  }

  // HANDLE WITHDRAW
  const handleWithdraw = async () =>{
	toaster.promise(
  	callContract('withdraw'),
  	{
    	loading: {
      	title: 'Broadcasting Transaction',
      	description: '',
    	},
    	success: ({result, method}) => (
      	{
      	title: 'Transaction Successful',
      	description: (
        	<>
          	{result.hash ? (
            	<a
              	className="underline"
              	href={buildTransactionUrl(result.hash)}
              	target="_blank"
            	>
              	View In Explorer
            	</a>
          	) : (
            	<p>
              	{method} : {result}
            	</p>
          	)}
        	</>
      	),
      	duration: 10000,
    	}),
    	error: (error: any) => ({
      	title: 'Error',
      	description: error.reason || error.message || 'An unknown error occurred',
      	duration: 10000,
    	}),
  	}
	);
  }

  // HANDLE MINT
  const handleMint = async () => {
	toaster.promise(
  	callContract('mint'),
  	{
    	loading: {
      	title: 'Broadcasting Transaction',
      	description: '',
    	},
    	success: ({result, method}) => (
      	{
      	title: 'Transaction Successful',
      	description: (
        	<>
          	{result.hash ? (
            	<a
              	className="underline"
              	href={buildTransactionUrl(result.hash)}
              	target="_blank"
            	>
              	View In Explorer
            	</a>
          	) : (
            	<p>
              	{method} : {result}
            	</p>
          	)}
        	</>
      	),
      	duration: 10000,
    	}),
    	error: (error: any) => ({
      	title: 'Error',
      	description: error.reason || error.message || 'An unknown error occurred',
      	duration: 10000,
    	}),
  	}
	);
  };

 
  useEffect(()=>{
	if(account){
  	callContract('owner');
  	callContract('tokenid');
  	callContract('supply');
  	callContract('mintPrice');
  	callContract('balanceOf');
  	callContract('symbol');
  	callContract('name');
  	getContractBalance();
	}
	if((Number(tokenId) >= 0) && (Number(tokenSupply) >= 0)){
  	if(tokenId == 0){
    	setRemainingSupply(Number(tokenSupply));
  	} else {
    	setRemainingSupply(Number(tokenSupply) - Number(tokenId));
  	}
  	console.log("Remaining Supply: "+remainingSupply);
	}
  }, [account, tokenId, tokenSupply, callContract, getContractBalance, remainingSupply]);

  return (
	<>
  	<div className="font-serif container mx-auto p-6 max-w-lg">
    	<div className="rounded-lg p-8">
   	 
      	<h1 className="text-3xl text-slate-200 font-bold text-center mb-6">QUAI NFT dApp</h1>
      	<p className="font-serif text-slate-200 mb-10">An example dApp that mints NFTs and provides additional functionality to the contract owner.</p>

      	<div className="mb-6">
        	{ (Number(tokenSupply) > 0) ?
          	<p className="text-center text-slate-200 mb-4">{Number(tokenSupply).toLocaleString()} NFTs available. </p> : <></>
        	}  	 

        	<div className="hover:border-blue-900 shadow-lg border-2 border-stone-800 bg-gradient-to-br via-blue-900 from-slate-500 to-slate-700 font-serif p-6 rounded-lg shadow-md">
            	<h3 className="text-3xl font-semibold text-slate-300 ">{nftName ? nftName : <></>}</h3>
            	<h3 className="text-2xl font-semibold text-slate-300 underline"><a href={'https://quaiscan.io/token/'+contractAddress} target="_blank">{symbol ? symbol : <></>}</a></h3>
            	{mintPrice ?
              	<p className="text-slate-300 mt-4">Mint Price: <span className="font-bold">{mintPrice.toLocaleString()} QUAI</span></p>
              	: <></>
            	}
            	<p className="text-slate-300 mt-4">Contract Balance: <span className="font-bold">{contractBalance.toLocaleString()} QUAI</span></p>
           	 
        	</div>
      	</div>

      	<div className="mb-4">
        	{account ?
          	<label className="block text-sm font-medium text-slate-200 mb01">Connected: <span className="text-blue-400 font-bold">{sortedQuaiShardNames[account.shard].name} {shortenAddress(account.addr)}</span></label>
          	: <></>}
      	</div>

      	{((remainingSupply > 0) && account) ?
        	<p className="text-center text-slate-200 mb-4">{remainingSupply.toLocaleString()} remaining</p>
        	: account ? <><p className="text-center text-slate-200 mb-4">No More NFTs Available</p></>
        	: <></>
      	}
      	{nftBalance > 0 ?
        	<p className="text-center text-slate-200 mb-4">{nftBalance.toLocaleString()} owned</p>
        	: account ? <><p className="text-center text-slate-200 mb-4">No NFTs Owned.</p></>
        	: <></>
      	}

      	<div className="text-center">
        	{(remainingSupply > 0) && account ?
          	<button
            	className="w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-blue-200 via-blue-300 to-blue-700 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-red-700 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
            	onClick={()=>handleMint()}>
              	<span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                	Mint
              	</span>
          	</button> : <></>
        	}
        	{!account ? <ConnectButton/> : <></>}
                     	 
       	 
        	{isOwner && account ?
          	<>
          	<button
            	className="w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-blue-200 via-blue-300 to-blue-700 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-red-700 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
            	onClick={()=>handleWithdraw()}>
              	<span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                	Withdraw
              	</span>
          	</button>
          	<div className="flex items-center space-x-2 mb-2">
            	<input onChange={e => setNewSupply(parseInt(e.target.value))} type="number" className="text-black px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="0"/>
            	<button className="w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-blue-200 via-blue-300 to-blue-700 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-red-700 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
              	onClick={()=>handleUpdateSupply()}
              	>
              	Update Supply
            	</button>
          	</div>
          	<div className="flex items-center space-x-2">
            	<input onChange={e => setNewPrice(parseInt(e.target.value))} type="number" className="text-black px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="0"/>
            	<button className="w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-blue-200 via-blue-300 to-blue-700 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-red-700 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
              	onClick={()=>handleUpdatePrice()}
              	>
              	Update Mint Price
            	</button>
          	</div>
         	 
          	</> : <></>
        	}

      	</div>
     	 
    	</div>
  	</div>
  	<Toaster/>
 	 
	</>
  )

}
```

## Running the App
Once all your changes are saved you can run `npm run dev` in the terminal and point your browser to `https://localhost:3000` to view your app!

When you connect with the wallet you used to deploy the app you will see the options to withdraw funds, and update supply or mint price. All other wallets will only be allowed to mint an NFT. The app won’t show this additional functionality to other wallets and the smart contract is written to only allow the owner to perform these functions. 

## Wrapping Up!
Congrats! You’ve just built your first NFT app on Quai! 

If you would like to view the complete repo for this project browse over to the tutorial's [repo](https://github.com/mpoletiek/quai-nft-dapp).

## Next Steps
If you’d like to continue to build and add more functionality here are some ideas to take this project further.

- Generate some metadata for your NFT.
    - By default the app uses `https://example.com` as the tokenuri for every minted NFT. This is set on line 29 on `page.tsx`. You can modify this behavior to point to a JSON file you’re hosting either on your own site or IPFS.
- Create some art for your NFT.
    - Once the metadata is set, you can produce and publish some art for your NFT viewable in NFT marketplaces or on Quaiscan
- Launch your NFT on QuaiMark!
    - QuaiMark is an NFT marketplace on Quai Network where people come to see what NFTs are available to buy, sell, and trade. Once you feel your project is ready, head over to Quaimark.com to check it out!
