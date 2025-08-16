"use client";

import * as React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, usePathname } from "next/navigation";

function parseAllowed(): string[] {
  if (typeof process === "undefined") return [];
  const raw = process.env.NEXT_PUBLIC_ALLOWED_ADMIN_WALLETS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toLowerCase());
}

async function verifyPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin }),
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
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      setChecked(false);
      const admins = parseAllowed();
      const pk = publicKey?.toBase58().toLowerCase();
      const isAdmin = connected && pk ? admins.includes(pk) : false;

      // Ha már admin oldalon vagyunk, ne pattogjon.
      const alreadyOnAdmin = pathname?.startsWith("/admin");

      if (!isAdmin) {
        setChecked(true);
        return;
      }

      // session flag
      const key = `pareidolia:admin:${pk}:authed`;
      const authed = sessionStorage.getItem(key) === "1";

      if (!authed) {
        // kérjünk PIN-t (egyszerű prompt a gyors integrációhoz)
        const pin = window.prompt("Enter admin PIN:");
        if (!pin) {
          setChecked(true);
          return;
        }
        const ok = await verifyPin(pin);
        if (!ok) {
          alert("Invalid PIN.");
          setChecked(true);
          return;
        }
        sessionStorage.setItem(key, "1");
      }

      // Redirect admin felületre, ha nem ott vagyunk
      if (!alreadyOnAdmin) {
        router.replace("/admin");
      }
      setChecked(true);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey?.toBase58(), pathname]);

  // Nem renderel UI-t; csak őrködik
  return null;
}
