// types/global.d.ts

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Existing environment variables
      ADMIN_PIN?: string;
      ADMIN_WALLETS?: string;
      NEXT_PUBLIC_ALLOWED_ADMIN_WALLETS?: string;
      NEXT_PUBLIC_SOLANA_RPC_URL?: string;
      GITHUB_REPO?: string;
      GITHUB_BRANCH?: string;
      GITHUB_TOKEN?: string;
      
      // New Coin Hub environment variables
      ADMIN_TOKEN?: string;
      NEXT_PUBLIC_ADMIN_TOKEN?: string; // For client-side admin forms (optional)
    }
  }
}

export {};