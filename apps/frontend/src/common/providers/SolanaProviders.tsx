"use client";

import { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  ConnectionProviderProps,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

require("@solana/wallet-adapter-react-ui/styles.css");

const WALLETS: Adapter[] = [];
const CONFIG: ConnectionProviderProps["config"] = {
  commitment: "confirmed",
};

export const SolanaProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ConnectionProvider
      endpoint={process.env.NEXT_PUBLIC_RPC_ENDPOINT!}
      config={CONFIG}
    >
      <WalletProvider wallets={WALLETS} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
