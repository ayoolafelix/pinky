/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.infura.io', 'arweave.net'],
  },
  env: {
    NEXT_PUBLIC_LP_AGENT_API: process.env.LP_AGENT_API || 'https://api.lpagent.io/v1',
    NEXT_PUBLIC_SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  },
};

module.exports = nextConfig;