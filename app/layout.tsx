import "./globals.css";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ClientWalletProviders = dynamic(
  () => import("@/components/solana/WalletProviders").then(m => m.WalletProviders),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "PAREIDOLIA",
  description: "See faces in things.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ClientWalletProviders>
          {children}
        </ClientWalletProviders>
      </body>
    </html>
  );
}
