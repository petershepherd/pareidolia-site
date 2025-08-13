import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

// A PAREIDOLIA SPL token MINT címe (a „contract address” nálatok a mint).
export const PAREIDOLIA_MINT = new PublicKey(
  "BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk"
);

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

// Visszaadja az adott mint összesített uiAmount-ját a tárcában.
export async function getTokenAmountForOwner(connection: any, owner: PublicKey, mint: PublicKey): Promise<number> {
  const resp = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID });
  let total = 0;
  for (const { account } of resp.value) {
    const data: any = account.data;
    if (data?.parsed?.info?.mint === mint.toBase58()) {
      const uiAmount = data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
      total += uiAmount;
    }
  }
  return total;
}

// Hook: true, ha a csatlakoztatott tárca > 0 PAREIDOLIA-t tart.
export function useHoldsPareidolia() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [holds, setHolds] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    async function run() {
      setError(null);
      if (!publicKey) { setHolds(false); return; }
      setLoading(true);
      try {
        const amt = await getTokenAmountForOwner(connection, publicKey, PAREIDOLIA_MINT);
        if (!cancel) setHolds(amt > 0);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Check failed");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    run();
    return () => { cancel = true; };
  }, [connection, publicKey]);

  return { loading, holds, error, publicKey };
}
