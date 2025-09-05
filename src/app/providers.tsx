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