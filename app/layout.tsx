import "./globals.css";
import type { Metadata } from "next";
import { WalletProviders } from "@/components/solana/WalletProviders";
import { Navbar } from "@/components/site-navbar";

export const metadata: Metadata = {
  title: "PAREIDOLIA",
  description: "See What You Want to See",
};

const LINKS = {
  dex: "https://letsbonk.fun/token/BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk",
  xCommunity: "https://x.com/i/communities/1954506369618391171",
  telegram: "https://t.me/pareidoliaportal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-neutral-950">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-cyan-500/40 selection:text-white">
        {/* Wallet context for the whole app */}
        <WalletProviders>
          {/* Global navbar on all pages */}
          <Navbar links={LINKS} showAdmin />
          <main className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </WalletProviders>
      </body>
    </html>
  );
}
