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