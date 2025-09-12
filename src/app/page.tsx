/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client'
import {useState,useEffect,useCallback} from 'react'
import { useContext } from 'react';
import { Toaster, toaster } from "@/components/ui/toaster"
import { buildTransactionUrl, shortenAddress, sortedQuaiShardNames } from '@/utils/quaisUtils';
import { quais } from 'quais';
import TestNFT from '../../artifacts/contracts/TestERC721.sol/TestERC721.json';
import { StateContext } from '@/app/store';
import ConnectButton from '@/components/ui/connectButton';
import { useGetAccounts } from '@/utils/wallet';
import OwnerControls from '@/components/OwnerControls';

export default function Mint() {
  useGetAccounts();
  const [nftName, setNFTName] = useState('NFT Name');
  const [symbol, setSymbol] = useState('NFT Symbol');
  const [isOwner, setIsOwner] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  const [baseTokenURI, setBaseTokenURI] = useState('');
  const [tokenIdInput, setTokenIdInput] = useState('');
  const [retrievedTokenURI, setRetrievedTokenURI] = useState('');
  const [maxMintPerAddress, setMaxMintPerAddress] = useState(0);
  const [nftBalance, setNFTBalance] = useState(0);
  const [mintPrice, setMintPrice] = useState(BigInt(0));
  const [tokenSupply, setTokenSupply] = useState(null);
  const [remainingSupply, setRemainingSupply] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const { web3Provider, account } = useContext(StateContext);
  const contractAddress = process.env.NEXT_PUBLIC_DEPLOYED_CONTRACT as string; // Change this to your contract address

  const getContractBalance = useCallback(async () => {
	const resp = await fetch('https://orchard.quaiscan.io/api/v2/addresses/'+contractAddress);
	const ret = await resp.json();
	if(ret.coin_balance){
  	setContractBalance(Number(ret.coin_balance)/Number(1000000000000000000));
  	console.log("Contract Balance: "+contractBalance);
	}
  }, [contractAddress, contractBalance])

  const callContract = useCallback(async (type: string) => {
	if(type == 'balanceOf') {
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const balance = await ERC721contract.balanceOf(account?.addr);
  	if(balance){
    	console.log("Balance: "+balance);
    	setNFTBalance(Number(balance));
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
    	const contractTransaction = await ERC721contract.mint(account?.addr,{value: price});
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
	else if(type=='baseTokenURI'){
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const uri = await ERC721contract.baseTokenURI();
  	if(uri){
    	setBaseTokenURI(uri);
  	}
  	return uri;
	}
	else if(type=='tokenURI'){
  	try {
    	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
    	if(tokenIdInput.trim() !== ''){
      	const tokenId = parseInt(tokenIdInput);
      	console.log("Fetching Token URI for ID: "+tokenId);
      	const tokenURI = await ERC721contract.tokenURI(tokenId);
      	setRetrievedTokenURI(tokenURI);
      	return Promise.resolve({ result: tokenURI, method: "tokenURI" });
    	}
  	} catch (err) {
    	return Promise.reject(err);
  	}
	}
	else if(type=='maxMintPerAddress'){
  	const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
  	const maxMint = await ERC721contract.maxMintPerAddress();
  	if(maxMint){
    	setMaxMintPerAddress(Number(maxMint));
  	}
  	return maxMint;
	}
  }, [contractAddress, web3Provider, account, tokenIdInput]);





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

  // HANDLE FETCH TOKEN URI
  const handleFetchTokenURI = async () => {
	setRetrievedTokenURI(''); // Clear previous result
	toaster.promise(
  	callContract('tokenURI'),
  	{
    	loading: {
      	title: 'Fetching Token URI',
      	description: 'Retrieving metadata from blockchain...',
    	},
    	success: ({result}) => (
      	{
      	title: 'Token URI Retrieved',
      	description: (
        	<>
          	<p className="mb-2">Token ID: {tokenIdInput}</p>
          	{result && (
            	<a
              	className="underline text-blue-400 hover:text-blue-300"
              	href={result}
              	target="_blank"
              	rel="noopener noreferrer"
            	>
              	View Metadata
            	</a>
          	)}
        	</>
      	),
      	duration: 10000,
    	}),
    	error: (error: any) => ({
      	title: 'Error',
      	description: error.reason || error.message || 'Token not found or invalid ID',
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
  	callContract('baseTokenURI');
  	callContract('maxMintPerAddress');
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
  	<div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black relative overflow-x-hidden">
    	{/* Enhanced Background Pattern */}
    	<div className="absolute inset-0 opacity-30">
      	<div 
        	className="absolute inset-0 w-full h-full"
        	style={{
          	backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.08'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='60' cy='60' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          	backgroundRepeat: 'repeat'
        	}}
      	></div>
    	</div>
    	
    	{/* Floating Elements */}
    	<div className="absolute top-20 left-10 w-20 h-20 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
    	<div className="absolute top-40 right-20 w-32 h-32 bg-red-600/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
    	<div className="absolute bottom-40 left-1/4 w-24 h-24 bg-red-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
    	
    	{/* Main Content Container */}
    	<div className="flex flex-col items-center justify-center z-10 min-h-screen">
      	{/* Hero Section */}
      	<div className="flex items-center justify-center pt-12 pb-8">
        	<div className="max-w-6xl mx-auto px-6">
          	<div className="text-center mb-12">
            	<div className="inline-flex items-center px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-4 animate-fade-in-up">
              	<span className="text-red-400 text-xs font-medium">🚀 Live on Quai Network</span>
            	</div>
            	<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-up">
              	<span className="gradient-text">QUAI</span>
              	<span className="text-white"> NFT DAPP</span>
            	</h1>
            	<p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 animate-fade-in-up">
              	Mint, trade, and discover unique digital collectibles on the fastest blockchain network
            	</p>
            	
            	{/* Connection Status */}
            	<div className="animate-fade-in-up">
              	{account ? (
                	<div className="inline-flex items-center space-x-4 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  	<div className="flex items-center space-x-2">
                    	<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    	<span className="text-green-400 font-semibold text-sm">Connected</span>
                  	</div>
                  	<div className="w-px h-4 bg-white/20"></div>
                  	<span className="text-gray-300 text-sm">
                    	{sortedQuaiShardNames[account.shard].name} • {shortenAddress(account.addr)}
                  	</span>
                	</div>
              	) : (
                	<div className="inline-flex items-center space-x-4 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  	<div className="flex items-center space-x-2">
                    	<div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    	<span className="text-red-400 font-semibold text-sm">Disconnected</span>
                  	</div>
                  	<div className="w-px h-4 bg-white/20"></div>
                  	<span className="text-gray-400 text-sm">Connect your wallet to get started</span>
                	</div>
              	)}
            	</div>
          	</div>
        	</div>
      	</div>

      	{/* Collection Overview Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<div className="glass-card rounded-2xl p-8 animate-fade-in-up">
          	<div className="text-center mb-8">
            	<div className="inline-flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
              	<span className="text-red-400 font-semibold text-sm">📊 Collection Stats</span>
            	</div>
            	<h2 className="text-3xl font-bold gradient-text mb-3">
              	{nftName || 'Loading...'}
            	</h2>
            	<p className="text-lg text-gray-300">
              	<span className="text-gray-400">Symbol:</span>{' '}
              	<a 
                	href={`https://orchard.quaiscan.io/token/${contractAddress}`} 
                	target="_blank" 
                	rel="noopener noreferrer"
                	className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
              	>
                	{symbol || 'Loading...'}
              	</a>
            	</p>
          	</div>

          	{/* Stats Grid */}
          	<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            	<div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300">
              	<div className="text-2xl font-bold text-white mb-1">
                	{Number(tokenSupply) > 0 ? Number(tokenSupply).toLocaleString() : '0'}
              	</div>
              	<div className="text-gray-400 font-medium text-sm">Total Supply</div>
            	</div>
            	<div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300">
              	<div className="text-2xl font-bold text-white mb-1">
                	{mintPrice ? `${mintPrice.toLocaleString()}` : '0'}
              	</div>
              	<div className="text-gray-400 font-medium text-sm">Mint Price (QUAI)</div>
            	</div>
            	<div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300">
              	<div className="text-2xl font-bold text-white mb-1">
                	{contractBalance.toLocaleString()}
              	</div>
              	<div className="text-gray-400 font-medium text-sm">Contract Balance (QUAI)</div>
            	</div>
            	<div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300">
              	<div className="text-2xl font-bold text-white mb-1">
                	{maxMintPerAddress > 0 ? maxMintPerAddress.toLocaleString() : '0'}
              	</div>
              	<div className="text-gray-400 font-medium text-sm">Max Per Address</div>
            	</div>
          	</div>

          	{/* Base URI Display */}
          	{baseTokenURI && (
            	<div className="p-4 bg-black/20 rounded-xl border border-white/10">
              	<div className="text-xs text-gray-400 mb-2 font-medium">Base Token URI</div>
              	<a 
                	href={baseTokenURI} 
                	target="_blank" 
                	rel="noopener noreferrer"
                	className="text-blue-400 hover:text-blue-300 transition-colors text-xs break-all block"
              	>
                	{baseTokenURI}
              	</a>
            	</div>
          	)}
        	</div>
      	</div>

      	{/* Main Action Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          	{/* User Portfolio Card */}
          	<div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            	<div className="text-center mb-6">
              	<div className="inline-flex items-center px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                	<span className="text-blue-400 font-semibold text-sm">👤 Your Portfolio</span>
              	</div>
              	<h3 className="text-2xl font-bold text-white mb-3">Personal Stats</h3>
            	</div>

            	{account ? (
              	<div className="space-y-6">
                	<div className="grid grid-cols-2 gap-4">
                  	<div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl border border-red-500/20">
                    	<div className="text-2xl font-bold text-white mb-1">
                      		{remainingSupply > 0 ? remainingSupply.toLocaleString() : '0'}
                    	</div>
                    	<div className="text-gray-400 font-medium text-sm">Available to Mint</div>
                  	</div>
                  	<div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20">
                    	<div className="text-2xl font-bold text-white mb-1">
                      		{nftBalance > 0 ? nftBalance.toLocaleString() : '0'}
                    	</div>
                    	<div className="text-gray-400 font-medium text-sm">You Own</div>
                  	</div>
                	</div>

                	{remainingSupply > 0 ? (
                  	<div className="space-y-3">
                    	<div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
                      		<p className="text-green-400 font-semibold text-lg">
                        		🎉 {remainingSupply.toLocaleString()} NFTs available to mint!
                      		</p>
                    	</div>
                    	{maxMintPerAddress > 0 && (
                      		<div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        		<p className="text-blue-400 text-sm">
                          			Mint Limit: {nftBalance}/{maxMintPerAddress} NFT{maxMintPerAddress > 1 ? 's' : ''}
                        		</p>
                        		{nftBalance >= maxMintPerAddress ? (
                          			<p className="text-orange-400 text-xs mt-1 font-semibold">
                            			⚠️ You&apos;ve reached your mint limit
                          			</p>
                        		) : (
                          			<p className="text-gray-400 text-xs mt-1">
                            			You can mint {maxMintPerAddress - nftBalance} more NFT{(maxMintPerAddress - nftBalance) !== 1 ? 's' : ''}
                          			</p>
                        		)}
                      		</div>
                    	)}
                  	</div>
                	) : (
                  	<div className="text-center p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl">
                    	<p className="text-red-300 font-semibold text-lg">
                      		⚠️ Collection sold out
                    	</p>
                  	</div>
                	)}
              	</div>
            	) : (
              	<div className="text-center py-8">
                	<div className="mb-6">
                  	<div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    	<span className="text-3xl">🔗</span>
                  	</div>
                  	<p className="text-gray-400 text-lg mb-6">Connect your wallet to view your portfolio</p>
                	</div>
                	<ConnectButton />
              	</div>
            	)}
          	</div>

          	{/* Minting Card */}
          	<div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            	<div className="text-center mb-6">
              	<div className="inline-flex items-center px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
                	<span className="text-red-400 font-semibold text-sm">🚀 Mint NFT</span>
              	</div>
              	<h3 className="text-2xl font-bold text-white mb-3">Mint Your NFT</h3>
              	<p className="text-gray-400 text-base">Get your unique digital collectible</p>
            	</div>

            	{account ? (
              	<div className="space-y-6">
                	{(remainingSupply > 0) ? (
                  	<>
                    	{/* Check if user has reached max mint limit */}
                    	{(maxMintPerAddress > 0 && nftBalance >= maxMintPerAddress) ? (
                      	<div className="text-center py-8">
                        	<div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          		<span className="text-3xl">🚫</span>
                        	</div>
                        	<p className="text-orange-300 text-lg font-semibold mb-3">Maximum mint limit reached</p>
                        	<p className="text-gray-400 text-base">
                          		You have already minted {nftBalance} of {maxMintPerAddress} allowed NFT{maxMintPerAddress > 1 ? 's' : ''}
                        	</p>
                      	</div>
                    	) : (
                      	<>
                        	<button
                          	className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25"
                          	onClick={() => handleMint()}
                        	>
                          	🚀 Mint NFT ({mintPrice ? `${mintPrice.toLocaleString()} QUAI` : '0 QUAI'})
                        	</button>
                        	{maxMintPerAddress > 0 && (
                          	<div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            	<p className="text-blue-400 text-sm">
                              		You can mint up to {maxMintPerAddress} NFT{maxMintPerAddress > 1 ? 's' : ''} per address
                            	</p>
                            	<p className="text-gray-400 text-xs mt-1">
                              		You currently own {nftBalance} NFT{nftBalance !== 1 ? 's' : ''}
                            	</p>
                          	</div>
                        	)}
                      	</>
                    	)}
                  	</>
                	) : (
                  	<div className="text-center py-8">
                    	<div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      		<span className="text-3xl">⚠️</span>
                    	</div>
                    	<p className="text-red-300 text-lg font-semibold">No NFTs available to mint</p>
                  	</div>
                	)}
              	</div>
            	) : (
              	<div className="text-center py-8">
                	<div className="mb-6">
                  	<div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    		<span className="text-3xl">🔐</span>
                  	</div>
                  	<p className="text-gray-400 text-lg mb-6">Connect your wallet to start minting</p>
                	</div>
                	<ConnectButton />
              	</div>
            	)}
          	</div>
        	</div>
      	</div>

      	{/* Token Lookup Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<div className="glass-card rounded-2xl p-6 animate-fade-in-up">
          	<div className="text-center mb-6">
            	<div className="inline-flex items-center px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
              	<span className="text-purple-400 font-semibold text-sm">🔍 Token Lookup</span>
            	</div>
            	<h3 className="text-2xl font-bold text-white mb-3">Explore Token Metadata</h3>
            	<p className="text-gray-400 text-base">Look up specific token URIs and metadata</p>
          	</div>

          	<div className="max-w-xl mx-auto">
            	<div className="space-y-4">
              	<label className="block text-base font-medium text-gray-300">Enter Token ID</label>
              	<div className="flex flex-col sm:flex-row gap-3">
                	<input
                  	onChange={e => setTokenIdInput(e.target.value)}
                  	type="number"
                  	className="input-modern flex-1 py-3 text-base"
                  	placeholder="Enter token ID (e.g., 0, 1, 2...)"
                  	value={tokenIdInput}
                	/>
                	<button
                  	className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  	onClick={() => handleFetchTokenURI()}
                  	disabled={!tokenIdInput.trim()}
                	>
                  	🔍 Lookup
                	</button>
              	</div>
            	</div>

            	{retrievedTokenURI && (
              	<div className="mt-6 p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                	<p className="text-xs text-gray-400 mb-3 font-medium">Token URI for ID: {tokenIdInput}</p>
                	<div className="p-3 bg-black/30 rounded-lg border border-white/10">
                  	<a
                    	href={retrievedTokenURI}
                    	target="_blank"
                    	rel="noopener noreferrer"
                    	className="text-blue-400 hover:text-blue-300 transition-colors text-xs break-all block"
                  	>
                    	{retrievedTokenURI}
                  	</a>
                	</div>
              	</div>
            	)}

            	{!account && (
              	<div className="text-center py-8">
                	<div className="mb-6">
                  	<div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    		<span className="text-3xl">🔐</span>
                  	</div>
                  	<p className="text-gray-400 text-lg mb-6">Connect your wallet to lookup token URIs</p>
                	</div>
                	<ConnectButton />
              	</div>
            	)}
          	</div>
        	</div>
      	</div>

      	{/* Owner Controls Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<OwnerControls 
          	contractAddress={contractAddress}
          	isOwner={isOwner}
          	account={account}
        	/>
      	</div>
    	</div>
  	</div>
  	<Toaster/>
	</>
  )

}