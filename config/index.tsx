// config/index.tsx
import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bsc } from '@reown/appkit/networks'

// Exportando o projectId
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string
if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Define as redes suportadas
export const networks = [bsc]

// Exportando o wagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig

export { bsc }
