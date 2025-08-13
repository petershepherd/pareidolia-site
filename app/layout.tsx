// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WalletProviders } from "@/components/solana/WalletProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PAREIDOLIA",
  description: "Illusion of life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-neutral-950 text-neutral-100`}>
        <WalletProviders>
          {children}
        </WalletProviders>
      </body>
    </html>
  );
}
