import type { WalletName } from "@solana/wallet-adapter-base";
import { WalletIcon } from "@solana/wallet-adapter-react-ui";
import React from "react";

import { AppWalletButton } from "./AppWalletButton";

type Props = React.ComponentProps<typeof AppWalletButton> & {
  walletIcon?: string;
  walletName?: WalletName;
};

export function BaseWalletConnectionButton({
  walletIcon,
  walletName,
  ...props
}: Props) {
  return (
    <AppWalletButton
      {...props}
      startIcon={
        walletIcon && walletName ? (
          <WalletIcon
            wallet={{ adapter: { icon: walletIcon, name: walletName } }}
          />
        ) : undefined
      }
    />
  );
}
