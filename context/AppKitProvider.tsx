'use client'
import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import React, { type ReactNode, useEffect, useState } from 'react'
import { cookieToInitialState, WagmiProvider, type Config, type State } from 'wagmi'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const metadata = {
  name: 'meu-app-web3',
  description: 'Minha Aplicação Web3',
  url: 'https://meuapp.com',
  icons: ['https://meuapp.com/icon.png']
}

const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true
  }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [initialState, setInitialState] = useState<State | null>(null)

  useEffect(() => {
    if (cookies) {
      const state = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
      if (state) {
        setInitialState(state)
      } else {
        setInitialState(null) // Fallback caso o estado seja undefined
      }
    }
  }, [cookies])

  if (!initialState) {
    return <div>Loading...</div>
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
