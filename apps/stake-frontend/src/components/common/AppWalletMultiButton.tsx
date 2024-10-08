"use client";

import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { getTruncatedString } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BaseWalletConnectionButton } from "./AppBaseWalletConnectionButton";
import { AppWalletButtonProps } from "./AppWalletButton";

type Props = AppWalletButtonProps;

function AppWalletMultiButtonComponent({ children, ...props }: Props) {
  const { setVisible: setModalVisible } = useWalletModal();
  const router = useRouter();
  const {
    buttonState,
    onConnect,
    onDisconnect,
    publicKey,
    walletIcon,
    walletName,
  } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const LABELS = useMemo(
    () =>
      ({
        "change-wallet": "Change",
        connecting: "Connecting",
        "copy-address": "Copy address",
        copied: "Copied",
        disconnect: "Disconnect",
        "has-wallet": "Connect",
        "no-wallet": "Connect Wallet",
      } as const),
    []
  );

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return;

      setMenuOpen(false);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  const content = useMemo(() => {
    if (children) {
      return children;
    } else if (publicKey) {
      const base58 = publicKey.toBase58();
      return getTruncatedString(base58);
    } else if (buttonState === "connecting" || buttonState === "has-wallet") {
      return LABELS[buttonState];
    } else {
      return LABELS["no-wallet"];
    }
  }, [children, publicKey, buttonState, LABELS]);

  return (
    <DropdownMenu open={menuOpen}>
      <DropdownMenuTrigger>
        <BaseWalletConnectionButton
          {...props}
          open={menuOpen}
          style={{ pointerEvents: menuOpen ? "none" : "auto" }}
          onClick={() => {
            switch (buttonState) {
              case "no-wallet":
                setModalVisible(true);
                break;
              case "has-wallet":
                if (onConnect) {
                  onConnect();
                }
                break;
              case "connected":
                setMenuOpen(true);
                break;
            }
          }}
          walletIcon={walletIcon}
          walletName={walletName}
        >
          {content}
        </BaseWalletConnectionButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" ref={ref}>
        {publicKey ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/portfolio/${publicKey.toBase58()}`);
                  setMenuOpen(false);
                }}
                role="menuitem"
              >
                Portfolio
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={async () => {
                  await navigator.clipboard.writeText(publicKey.toBase58());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 400);
                }}
                role="menuitem"
              >
                {copied ? LABELS["copied"] : LABELS["copy-address"]}
              </DropdownMenuItem>
              {onDisconnect ? (
                <DropdownMenuItem
                  onClick={() => {
                    onDisconnect();
                    setMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  {LABELS["disconnect"]}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const AppWalletMultiButton = dynamic(
  () => Promise.resolve(AppWalletMultiButtonComponent),
  {
    ssr: false,
  }
);
