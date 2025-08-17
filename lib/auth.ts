export function getAdminWalletSet(): Set<string> {
  const raw =
    process.env.NEXT_PUBLIC_ALLOWED_ADMIN_WALLETS ||
    process.env.ADMIN_WALLETS || // fallback, ha régi env maradt
    "";
  return new Set(
    raw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
  );
}

/** pontos (case-sensitive) egyezés! */
export function isAllowedAdminWallet(wallet?: string): boolean {
  if (!wallet) return false;
  return getAdminWalletSet().has(wallet);
}

export function checkAdminPin(pin?: string): boolean {
  const p = process.env.ADMIN_PIN || "";
  return !!pin && pin === p;
}
