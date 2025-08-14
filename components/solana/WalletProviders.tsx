"use client";

import React, { useMemo, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

require("@solana/wallet-adapter-react-ui/styles.css");

export function WalletProviders({ children }: { children: React.ReactNode }) {
  // 1) Vercel env-ből olvassuk az endpointot (Project Settings → Environment Variables)
  // 2) Ha nincs jól beállítva, fallback a Helius-ra (a te kulcsoddal)
  const raw = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const fromEnv = typeof raw === "string" ? raw.trim() : "";
  const isValid = /^https?:\/\//.test(fromEnv);

  const endpoint = isValid
    ? fromEnv
    : "https://mainnet.helius-rpc.com/?api-key=d8290be6-073f-4afe-bc22-b9c29d0fb5c1";

  // Kis diagnosztika a konzolban (build és kliens oldalon is látszik)
  useEffect(() => {
    if (!isValid) {
      console.warn(
        "[WalletProviders] NEXT_PUBLIC_SOLANA_RPC_URL is missing or invalid. Falling back to Helius."
      );
    }
    console.log("[WalletProviders] Using RPC endpoint:", endpoint);
  }, [isValid, endpoint]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: "processed" }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

