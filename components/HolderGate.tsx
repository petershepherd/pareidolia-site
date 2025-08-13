"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectWalletButton } from "@/components/solana/ConnectWalletButton";
import { useHoldsPareidolia } from "@/lib/solana";

export function HolderGate({
  children,
  title = "Unlock deeper hint (holders only)",
  requireAmountText = "Connect your wallet and hold any amount of $PAREIDOLIA to access this.",
}: {
  children: React.ReactNode;
  title?: string;
  requireAmountText?: string;
}) {
  const { loading, holds, error, publicKey } = useHoldsPareidolia();

  if (holds) return <>{children}</>;

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-neutral-300">{requireAmountText}</p>
        <ConnectWalletButton />
        {publicKey && (
          <p className="text-xs text-neutral-400 break-all">
            Connected: {publicKey.toBase58()}
          </p>
        )}
        {loading && <p className="text-xs text-neutral-400">Checking holdings…</p>}
        {error && <p className="text-xs text-red-400">Error: {error}</p>}
      </CardContent>
    </Card>
  );
}
