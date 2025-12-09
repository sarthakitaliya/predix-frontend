"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { ThemeProvider } from "next-themes";
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';

export default function Providers({ children }: { children: React.ReactNode }) {
  console.log(
    "id",
    process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID
  );
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          solana: {
            createOnLogin: "all-users",
          },
        },
        solana: {
          rpcs: {
            'solana:devnet': {
              rpc: createSolanaRpc(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'),
              rpcSubscriptions: createSolanaRpcSubscriptions(process.env.NEXT_PUBLIC_WS_RPC_URL || 'wss://api.devnet.solana.com'),
            },
          }
        },
        appearance: {
          theme: "dark",
        },
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </PrivyProvider>
  );
}
