'use client';

import { useContext } from 'react';
import { StateContext, DispatchContext } from '@/app/store';
import { requestAccounts } from '@/utils/wallet';

const ConnectButton = () => {
  const { web3Provider } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const connectHandler = () => {
	requestAccounts(dispatch, web3Provider);
  };

  if (!web3Provider) {
	return (
  	<a
    	className="w-full btn-primary text-lg py-4 rounded-xl font-semibold flex items-center justify-center space-x-2"
    	href="https://chromewebstore.google.com/detail/pelagus/nhccebmfjcbhghphpclcfdkkekheegop"
    	target="_blank"
    	rel="noopener noreferrer"
  	>
    	<span>🔗</span>
    	<span>Install Pelagus Wallet</span>
  	</a>
	);
  } else {
	return (
    	<button
      	className="w-full btn-primary text-lg py-4 rounded-xl font-semibold flex items-center justify-center space-x-2"
      	onClick={connectHandler}
    	>
      	<span>🔌</span>
      	<span>Connect Wallet</span>
    	</button>
	);
  }
};

export default ConnectButton;