"use client";
import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function ConnectWalletButton() {
  // A csomag adja a modált + bejelentkezést; itt csak kicsit sty-lolunk Tailwind-del.
  return (
    <WalletMultiButton className="!rounded-2xl !bg-white/10 !border !border-white/20 hover:!bg-white/20" />
  );
}
