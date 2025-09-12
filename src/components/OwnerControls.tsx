/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client'
import { useState } from 'react';
import { useContext } from 'react';
import { toaster } from "@/components/ui/toaster"
import { buildTransactionUrl } from '@/utils/quaisUtils';
import { quais } from 'quais';
import TestNFT from '../../artifacts/contracts/TestERC721.sol/TestERC721.json';
import { StateContext } from '@/app/store';

interface OwnerControlsProps {
  contractAddress: string;
  isOwner: boolean;
  account: any;
}

export default function OwnerControls({ contractAddress, isOwner, account }: OwnerControlsProps) {
  // Owner-specific state
  const [newSupply, setNewSupply] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [newBaseTokenURI, setNewBaseTokenURI] = useState('');
  const [newMaxMintPerAddress, setNewMaxMintPerAddress] = useState(0);
  const { web3Provider } = useContext(StateContext);

  const callContract = async (type: string) => {
    if(type == 'updateSupply'){
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
    else if(type == 'updatePrice'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
        
        const priceQuai = quais.parseQuai(String(newPrice));
        console.log("New Price Value: "+priceQuai);
        const contractTransaction = await ERC721contract.updateMintPrice(priceQuai);
        const txReceipt = await contractTransaction.wait();
        console.log(txReceipt);
        return Promise.resolve({ result: txReceipt, method: "updateMintPrice" });
        
      } catch (err) {
        return Promise.reject(err);
      }
    }
    else if(type == 'updateBaseTokenURI'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
        if(newBaseTokenURI.trim() !== ''){
          console.log("New Base Token URI: "+newBaseTokenURI);
          const contractTransaction = await ERC721contract.updateBaseTokenURI(newBaseTokenURI);
          const txReceipt = await contractTransaction.wait();
          console.log(txReceipt);
          return Promise.resolve({ result: txReceipt, method: "updateBaseTokenURI" });
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
    else if(type == 'updateMaxMintPerAddress'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TestNFT.abi, await web3Provider.getSigner());
        if(newMaxMintPerAddress > 0){
          console.log("New Max Mint Per Address: "+newMaxMintPerAddress);
          const contractTransaction = await ERC721contract.updateMaxMintPerAddress(newMaxMintPerAddress);
          const txReceipt = await contractTransaction.wait();
          console.log(txReceipt);
          return Promise.resolve({ result: txReceipt, method: "updateMaxMintPerAddress" });
        }
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
  };

  // HANDLE UPDATE SUPPLY
  const handleUpdateSupply = async () => {
    toaster.promise(
      callContract('updateSupply'),
      {
        loading: {
          title: 'Broadcasting Transaction',
          description: '',
        },
        success: (data: any) => (
          {
          title: 'Transaction Successful',
          description: (
            <>
              {data?.result?.hash ? (
                <a
                  className="underline"
                  href={buildTransactionUrl(data.result.hash)}
                  target="_blank"
                >
                  View In Explorer
                </a>
              ) : (
                <p>
                  {data?.method} : {data?.result}
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

  // HANDLE UPDATE PRICE
  const handleUpdatePrice = async () => {
    toaster.promise(
      callContract('updatePrice'),
      {
        loading: {
          title: 'Broadcasting Transaction',
          description: '',
        },
        success: (data: any) => (
          {
          title: 'Transaction Successful',
          description: (
            <>
              {data?.result?.hash ? (
                <a
                  className="underline"
                  href={buildTransactionUrl(data.result.hash)}
                  target="_blank"
                >
                  View In Explorer
                </a>
              ) : (
                <p>
                  {data?.method} : {data?.result}
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

  // HANDLE UPDATE BASE TOKEN URI
  const handleUpdateBaseTokenURI = async () => {
    toaster.promise(
      callContract('updateBaseTokenURI'),
      {
        loading: {
          title: 'Broadcasting Transaction',
          description: '',
        },
        success: (data: any) => {
          setNewBaseTokenURI(''); // Clear the input field
          return {
            title: 'Transaction Successful',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>
                    {data?.method} : {data?.result}
                  </p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }

  // HANDLE UPDATE MAX MINT PER ADDRESS
  const handleUpdateMaxMintPerAddress = async () => {
    toaster.promise(
      callContract('updateMaxMintPerAddress'),
      {
        loading: {
          title: 'Broadcasting Transaction',
          description: '',
        },
        success: (data: any) => {
          setNewMaxMintPerAddress(0); // Clear the input field
          return {
            title: 'Transaction Successful',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>
                    {data?.method} : {data?.result}
                  </p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }

  // HANDLE WITHDRAW
  const handleWithdraw = async () => {
    toaster.promise(
      callContract('withdraw'),
      {
        loading: {
          title: 'Broadcasting Transaction',
          description: '',
        },
        success: (data: any) => (
          {
          title: 'Transaction Successful',
          description: (
            <>
              {data?.result?.hash ? (
                <a
                  className="underline"
                  href={buildTransactionUrl(data.result.hash)}
                  target="_blank"
                >
                  View In Explorer
                </a>
              ) : (
                <p>
                  {data?.method} : {data?.result}
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

  if (!isOwner || !account) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
          <span className="text-orange-400 font-semibold text-sm">⚙️ Owner Controls</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Collection Management</h3>
        <p className="text-gray-400 text-base">Manage your NFT collection settings and parameters</p>
      </div>
      
      <div className="space-y-6">
        {/* Withdraw Button */}
        <div className="text-center">
          <button
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25"
            onClick={() => handleWithdraw()}
          >
            💰 Withdraw Funds
          </button>
        </div>

        {/* Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Update Supply */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-300">Update Supply</label>
            <div className="flex flex-col gap-3">
              <input
                onChange={e => setNewSupply(parseInt(e.target.value))}
                type="number"
                className="input-modern py-3 text-base"
                placeholder="Enter new supply"
              />
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={() => handleUpdateSupply()}
              >
                Update Supply
              </button>
            </div>
          </div>

          {/* Update Price */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-300">Update Mint Price (QUAI)</label>
            <div className="flex flex-col gap-3">
              <input
                onChange={e => setNewPrice(parseInt(e.target.value))}
                type="number"
                className="input-modern py-3 text-base"
                placeholder="Enter new price"
              />
              <button
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={() => handleUpdatePrice()}
              >
                Update Price
              </button>
            </div>
          </div>

          {/* Update Base Token URI */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-300">Update Base Token URI</label>
            <div className="flex flex-col gap-3">
              <input
                onChange={e => setNewBaseTokenURI(e.target.value)}
                type="text"
                className="input-modern py-3 text-base"
                placeholder="Enter new base URI"
              />
              <button
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={() => handleUpdateBaseTokenURI()}
              >
                Update URI
              </button>
            </div>
          </div>

          {/* Update Max Mint Per Address */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-300">Update Max Mint Per Address</label>
            <div className="flex flex-col gap-3">
              <input
                onChange={e => setNewMaxMintPerAddress(parseInt(e.target.value))}
                type="number"
                className="input-modern py-3 text-base"
                placeholder="Enter max mints per address"
              />
              <button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={() => handleUpdateMaxMintPerAddress()}
              >
                Update Limit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
