"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { type ConnectionConfig } from "@solana/web3.js";

import { ENV } from "@/lib/constants";

const WALLETS: Adapter[] = [];
const CONNECTION_CONFIG: ConnectionConfig = { commitment: "confirmed" };

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const endpoint = ENV.solanaRPCUrl;

  return (
    <ConnectionProvider endpoint={endpoint} config={CONNECTION_CONFIG}>
      <WalletProvider wallets={WALLETS} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
