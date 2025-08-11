```tsx
export const metadata = {
  title: "PAREIDOLIA",
  description: "See what you want to see.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```
