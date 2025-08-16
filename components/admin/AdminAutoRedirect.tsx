"use client";

import * as React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, usePathname } from "next/navigation";

function parseAllowed(): string[] {
  // NEXT_PUBLIC_* kliensoldalon elérhető; SSR guard csak safety
  if (typeof process === "undefined") return [];
  const raw = process.env.NEXT_PUBLIC_ALLOWED_ADMIN_WALLETS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function verifyPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin }),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = await res.json();
    return !!json.ok;
  } catch {
    return false;
  }
}

/**
 * Auto-redirects to /admin if:
 * - wallet is connected
 * - wallet is in NEXT_PUBLIC_ALLOWED_ADMIN_WALLETS
 * - valid ADMIN_PIN was provided at least once in this session
 */
export default function AdminAutoRedirect() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [prompted, setPrompted] = React.useState(false);

  // Stabil, memo-izált kulcs
  const pk = React.useMemo(
    () => (publicKey ? publicKey.toBase58().toLowerCase() : undefined),
    [publicKey]
  );

  React.useEffect(() => {
    // csak böngészőben
    if (typeof window === "undefined") return;

    const run = async () => {
      const admins = parseAllowed();
      const isAdmin = connected && pk ? admins.includes(pk) : false;
      const alreadyOnAdmin = pathname?.startsWith("/admin");

      if (!isAdmin) return;

      const key = `pareidolia:admin:${pk}:authed`;
      const authed = sessionStorage.getItem(key) === "1";

      if (!authed) {
        // csak egyszer promptolunk per mounting/session
        if (prompted) return;
        setPrompted(true);

        const pin = window.prompt("Enter admin PIN:");
        if (!pin) return;

        const ok = await verifyPin(pin);
        if (!ok) {
          alert("Invalid PIN.");
          return;
        }
        sessionStorage.setItem(key, "1");
      }

      if (!alreadyOnAdmin) {
        router.replace("/admin");
      }
    };

    run();
  }, [connected, pk, pathname, router, prompted]);

  return null;
}
