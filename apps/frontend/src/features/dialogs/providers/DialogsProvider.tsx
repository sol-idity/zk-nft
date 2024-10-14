"use client";

import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { TransferDialog } from "./components/TransferDialog";
import { Toaster } from "@/shadcn/components/ui/sonner";
// import { AchOnlyWarningDialog } from './AchOnlyWarningDialog';

export interface DialogsContextValue {
  // Transfer dialog
  isTransferDialogOpen: boolean;
  getRecipientPublicKey: () => Promise<string | null>;
  // eslint-disable-next-line no-unused-vars
  submitRecipientPublicKey: (publicKey: string) => void;
  cancelTransfer: () => void;
}

export const DialogsContext = createContext({} as DialogsContextValue);

export const DialogsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const resolveTransferDialogRef = useRef<
    // eslint-disable-next-line no-unused-vars
    ((publicKey: string | null) => void) | null
  >(null);
  const getRecipientPublicKey = useCallback(async () => {
    setIsTransferDialogOpen(true);
    return new Promise<string | null>((resolve) => {
      resolveTransferDialogRef.current = resolve;
    });
  }, []);
  const submitRecipientPublicKey = useCallback((publicKey: string) => {
    setIsTransferDialogOpen(false);
    resolveTransferDialogRef.current?.(publicKey);
    resolveTransferDialogRef.current = null;
  }, []);
  const cancelTransfer = useCallback(() => {
    setIsTransferDialogOpen(false);
    resolveTransferDialogRef.current?.(null);
    resolveTransferDialogRef.current = null;
  }, []);

  const dialogsContextValue: DialogsContextValue = useMemo(
    () => ({
      isTransferDialogOpen,
      getRecipientPublicKey,
      submitRecipientPublicKey,
      cancelTransfer,
    }),
    [
      isTransferDialogOpen,
      getRecipientPublicKey,
      submitRecipientPublicKey,
      cancelTransfer,
    ]
  );

  return (
    <DialogsContext.Provider value={dialogsContextValue}>
      <TransferDialog />
      {children}
      <Toaster />
    </DialogsContext.Provider>
  );
};
