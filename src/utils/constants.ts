// Contract and network constants
export const DEPLOYED_CONTRACT = process.env.NEXT_PUBLIC_DEPLOYED_CONTRACT || '0x00127b78F447b0711Ebb4ebc6C9AD651A3Ca7D43';

// Network configuration
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://orchard.rpc.quai.network';
export const CHAIN_ID = process.env.CHAIN_ID || '15000';

// Explorer URLs
export const EXPLORER_BASE_URL = process.env.NEXT_PUBLIC_BLOCKEXPLORER || 'https://orchard.quaiscan.io';
export const EXPLORER_ADDRESS_URL = (address: string) => `${EXPLORER_BASE_URL}/address/${address}`;
export const EXPLORER_TX_URL = (txHash: string) => `${EXPLORER_BASE_URL}/tx/${txHash}`;
export const EXPLORER_TOKEN_URL = (address: string) => `${EXPLORER_BASE_URL}/token/${address}`;