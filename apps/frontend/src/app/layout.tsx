import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/shadcn/utils";
import { SolanaProviders } from "@/common/providers/SolanaProviders";
import { DialogsProvider } from "@/features/dialogs/providers/DialogsProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "zkNFT",
  description: "Zero Knowledge NFT. Only possible on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "h-full bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <SolanaProviders>
          <DialogsProvider>{children}</DialogsProvider>
        </SolanaProviders>
      </body>
    </html>
  );
}
