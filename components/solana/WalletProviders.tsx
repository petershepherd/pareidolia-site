"use client";

import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

require("@solana/wallet-adapter-react-ui/styles.css");

export function WalletProviders({ children }: { children: React.ReactNode }) {
  // .env-ből olvasunk, de ha hiányzik vagy nem http/https, fallback Ankr-re
  const envEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const endpoint =
    envEndpoint && /^https?:/.test(envEndpoint)
      ? envEndpoint
      : "https://rpc.ankr.com/solana";

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
