/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client'
import {useState,useEffect} from 'react'
import { useContext } from 'react';
import { Toaster, toaster } from "@/components/ui/toaster"
import { buildTransactionUrl, shortenAddress, sortedQuaiShardNames } from '@/utils/quaisUtils';
import { quais } from 'quais';
import TestNFT from '../../artifacts/contracts/TestERC721.sol/TestERC721.json';
import { StateContext } from '@/app/store';
import ConnectButton from '@/components/ui/connectButton';
import { useGetAccounts } from '@/utils/wallet';

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

  const getContractBalance = async () => {
	const resp = await fetch('https://orchard.quaiscan.io/api/v2/addresses/'+contractAddress);
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
  	<div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black relative">
    	{/* Background Pattern */}
    	<div className="absolute inset-0 opacity-20">
      	<div 
        	className="absolute inset-0 w-full h-full"
        	style={{
          	backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          	backgroundRepeat: 'repeat'
        	}}
      	></div>
    	</div>
    	
    	{/* Main Content Container - Centered */}
    	<div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
      	<div className="w-full max-w-6xl mx-auto px-6 py-12">
      	{/* Hero Section */}
      	<div className="text-center mb-16 animate-fade-in-up">
        	<h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-10">
          	<span className="gradient-text">QUAI NFT</span>
          	<br />
          	<span className="text-white">Marketplace</span>
        	</h1>
        	<p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed text-center mb-4">
          	Discover, mint, and trade unique NFTs on the Quai Network. Experience the future of digital collectibles.
        	</p>
      	</div>

      	{/* Connection Status */}
      	<div className="mb-12 animate-fade-in-up">
        	{account ? (
          	<div className="flex items-center justify-center space-x-4 p-4">
            	<div className="status-connected">● Connected</div>
            	<span className="text-gray-300 text-lg">
              	{sortedQuaiShardNames[account.shard].name} • {shortenAddress(account.addr)}
            	</span>
          	</div>
        	) : (
          	<div className="flex items-center justify-center space-x-4 p-4">
            	<div className="status-disconnected">● Disconnected</div>
            	<span className="text-gray-400 text-lg">Connect your wallet to get started</span>
          	</div>
        	)}
      	</div>

      	{/* Main Content Grid */}
      	<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        	{/* NFT Collection Card */}
        	<div className="glass-card rounded-2xl p-10 animate-fade-in-up">
          	<div className="flex items-center justify-between mb-8">
            	<h2 className="text-3xl font-bold text-white">Collection</h2>
            	<div className="text-right">
              	{Number(tokenSupply) > 0 && (
                	<p className="text-sm text-gray-400 mb-1">Total Supply</p>
              	)}
              	<p className="text-xl font-semibold text-white">
                	{Number(tokenSupply) > 0 ? Number(tokenSupply).toLocaleString() : 'Loading...'}
              	</p>
            	</div>
          	</div>

          	<div className="space-y-6">
            	<div>
              	<h3 className="text-4xl font-bold gradient-text mb-4">
                	{nftName || 'Loading...'}
              	</h3>
              	<p className="text-xl text-gray-300">
                	<span className="text-gray-400">Symbol:</span>{' '}
                	<a 
                  	href={`https://orchard.quaiscan.io/token/${contractAddress}`} 
                  	target="_blank" 
                  	rel="noopener noreferrer"
                  	className="text-blue-400 hover:text-blue-300 transition-colors"
                	>
                  	{symbol || 'Loading...'}
                	</a>
              	</p>
            	</div>

            	<div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-700">
              	<div className="p-4 bg-white/5 rounded-xl">
                	<p className="text-sm text-gray-400 mb-2">Mint Price</p>
                	<p className="text-xl font-semibold text-white">
                  	{mintPrice ? `${mintPrice.toLocaleString()} QUAI` : 'Loading...'}
                	</p>
              	</div>
              	<div className="p-4 bg-white/5 rounded-xl">
                	<p className="text-sm text-gray-400 mb-2">Contract Balance</p>
                	<p className="text-xl font-semibold text-white">
                  	{contractBalance.toLocaleString()} QUAI
                	</p>
              	</div>
            	</div>
          	</div>
        	</div>

        	{/* User Stats Card */}
        	<div className="glass-card rounded-2xl p-10 animate-fade-in-up">
          	<div className="flex items-center justify-between mb-8">
            	<h2 className="text-3xl font-bold text-white">Your Stats</h2>
            	<div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
          	</div>

          	<div className="space-y-8">
            	{account ? (
              	<>
                	<div className="grid grid-cols-2 gap-6">
                  	<div className="text-center p-6 bg-white/5 rounded-xl">
                    	<p className="text-sm text-gray-400 mb-2">Remaining</p>
                    	<p className="text-3xl font-bold text-white">
                      		{remainingSupply > 0 ? remainingSupply.toLocaleString() : '0'}
                    	</p>
                  	</div>
                  	<div className="text-center p-6 bg-white/5 rounded-xl">
                    	<p className="text-sm text-gray-400 mb-2">You Own</p>
                    	<p className="text-3xl font-bold text-white">
                      		{nftBalance > 0 ? nftBalance.toLocaleString() : '0'}
                    	</p>
                  	</div>
                	</div>

                	{remainingSupply > 0 ? (
                  	<p className="text-center text-red-400 font-medium text-lg py-4">
                    	🎉 {remainingSupply.toLocaleString()} NFTs available to mint!
                  	</p>
                	) : (
                  	<p className="text-center text-red-300 font-medium text-lg py-4">
                    	⚠️ Collection sold out
                  	</p>
                	)}
              	</>
            	) : (
              	<div className="text-center py-8">
                	<p className="text-gray-400 mb-4">Connect your wallet to view your stats</p>
                	<ConnectButton />
              	</div>
            	)}
          	</div>
        	</div>
      	</div>

      	{/* Action Buttons */}
      	<div className="glass-card rounded-2xl p-10 animate-fade-in-up">
        	<div className="text-center mb-8">
          	<h2 className="text-3xl font-bold text-white mb-4">Actions</h2>
          	<p className="text-gray-400 text-lg">Mint NFTs and manage your collection</p>
        	</div>

        	<div className="space-y-6">
          	{/* Mint Button */}
          	{(remainingSupply > 0) && account ? (
            	<button
              	className="w-full btn-primary text-lg py-4 rounded-xl font-semibold"
              	onClick={() => handleMint()}
            	>
              	🚀 Mint NFT ({mintPrice ? `${mintPrice.toLocaleString()} QUAI` : 'Loading...'})
            	</button>
          	) : !account ? (
            	<ConnectButton />
          	) : (
            	<div className="text-center py-8">
              	<p className="text-gray-400">No NFTs available to mint</p>
            	</div>
          	)}

          	{/* Owner Controls */}
          	{isOwner && account && (
            	<div className="mt-10 pt-8 border-t border-gray-700">
              	<h3 className="text-xl font-semibold text-white mb-6 text-center">Owner Controls</h3>
              	
              	<div className="space-y-6">
                	{/* Withdraw Button */}
                	<button
                  	className="w-full btn-secondary text-lg py-3 rounded-xl font-semibold"
                  	onClick={() => handleWithdraw()}
                	>
                  	💰 Withdraw Funds
                	</button>

                	{/* Update Supply */}
                	<div className="space-y-4">
                  	<label className="block text-base font-medium text-gray-300">Update Supply</label>
                  	<div className="flex space-x-4">
                    	<input
                      	onChange={e => setNewSupply(parseInt(e.target.value))}
                      	type="number"
                      	className="input-modern flex-1 py-4"
                      	placeholder="Enter new supply"
                    	/>
                    	<button
                      	className="btn-secondary px-8 py-4 rounded-xl font-semibold whitespace-nowrap"
                      	onClick={() => handleUpdateSupply()}
                    	>
                      	Update
                    	</button>
                  	</div>
                	</div>

                	{/* Update Price */}
                	<div className="space-y-4">
                  	<label className="block text-base font-medium text-gray-300">Update Mint Price (QUAI)</label>
                  	<div className="flex space-x-4">
                    	<input
                      	onChange={e => setNewPrice(parseInt(e.target.value))}
                      	type="number"
                      	className="input-modern flex-1 py-4"
                      	placeholder="Enter new price"
                    	/>
                    	<button
                      	className="btn-secondary px-8 py-4 rounded-xl font-semibold whitespace-nowrap"
                      	onClick={() => handleUpdatePrice()}
                    	>
                      	Update
                    	</button>
                  	</div>
                	</div>
              	</div>
            	</div>
          	)}
        	</div>
      	</div>
      	</div>
    	</div>
  	</div>
  	<Toaster/>
	</>
  )

}