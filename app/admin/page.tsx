"use client";

import * as React from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Lock, Settings, Trophy, ShieldAlert } from "lucide-react";

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

export default function AdminHomePage() {
  const { publicKey, connected } = useWallet();
  const [authed, setAuthed] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  // admin státusz bepöccintése sessionStorage alapján
  React.useEffect(() => {
    const admins = parseAllowed();
    const pk = publicKey?.toBase58().toLowerCase();
    const isAdmin = connected && pk ? admins.includes(pk) : false;

    if (!isAdmin) {
      setAuthed(false);
      setChecking(false);
      return;
    }

    const key = `pareidolia:admin:${pk}:authed`;
    const flag = sessionStorage.getItem(key) === "1";
    setAuthed(flag);
    setChecking(false);
  }, [connected, publicKey?.toBase58()]);

  const handleEnterPin = async () => {
    const pin = window.prompt("Enter admin PIN:");
    if (!pin) return;
    const ok = await verifyPin(pin);
    if (!ok) {
      alert("Invalid PIN.");
      return;
    }
    const pk = publicKey?.toBase58().toLowerCase();
    if (pk) {
      sessionStorage.setItem(`pareidolia:admin:${pk}:authed`, "1");
      setAuthed(true);
    }
  };

  // UI
  return (
    <div className="py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-neutral-400">Manage contests and review community submissions.</p>
        </div>
      </div>

      {/* Állapotkártya */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        {checking ? (
          <p className="text-neutral-300">Checking admin status…</p>
        ) : (
          <>
            {!connected ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="font-medium">Wallet not connected</p>
                    <p className="text-neutral-400 text-sm">
                      Connect an admin wallet to access the dashboard.
                    </p>
                  </div>
                </div>
                <WalletMultiButton className="!rounded-2xl !bg-white/10 !text-white !border !border-white/20 hover:!bg-white/20" />
              </div>
            ) : !parseAllowed().includes(publicKey?.toBase58().toLowerCase() || "") ? (
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-medium">This wallet is not authorized</p>
                  <p className="text-neutral-400 text-sm">
                    Ask an existing admin to add your wallet to <code>NEXT_PUBLIC_ALLOWED_ADMIN_WALLETS</code>.
                  </p>
                </div>
              </div>
            ) : !authed ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="font-medium">PIN required</p>
                    <p className="text-neutral-400 text-sm">
                      Enter the 6-character admin PIN to continue.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEnterPin}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                >
                  Enter PIN
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-neutral-300">Authorized as admin.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Admin csempék */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/contest"
          className={`rounded-2xl border border-white/10 p-5 transition ${
            authed ? "bg-white/5 hover:bg-white/10" : "bg-white/[0.03] opacity-60 pointer-events-none"
          }`}
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Trophy className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Open Contest Admin</h2>
          <p className="text-sm text-neutral-400">
            Create daily prompts, set dates, and manage source images.
          </p>
        </Link>

        <Link
          href="/admin/moderate"
          className={`rounded-2xl border border-white/10 p-5 transition ${
            authed ? "bg-white/5 hover:bg-white/10" : "bg-white/[0.03] opacity-60 pointer-events-none"
          }`}
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Settings className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">Open Moderation</h2>
          <p className="text-sm text-neutral-400">
            Review and curate community-submitted base images.
          </p>
        </Link>
      </div>
    </div>
  );
}
