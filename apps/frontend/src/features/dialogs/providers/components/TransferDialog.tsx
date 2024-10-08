import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shadcn/components/ui/alert-dialog";
import { DialogsContext } from "../DialogsProvider";
import { useContext, useEffect, useState } from "react";
import { Input } from "@/shadcn/components/ui/input";

export const TransferDialog = () => {
  const { isTransferDialogOpen, submitRecipientPublicKey, cancelTransfer } =
    useContext(DialogsContext);

  const [recipientPublicKey, setRecipientPublicKey] = useState("");

  useEffect(
    function resetOnOpen() {
      if (isTransferDialogOpen) {
        setRecipientPublicKey("");
      }
    },
    [isTransferDialogOpen]
  );

  return (
    <AlertDialog open={isTransferDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Transfer asset</AlertDialogTitle>
          <AlertDialogDescription>
            <Input
              value={recipientPublicKey}
              onChange={(e) => {
                setRecipientPublicKey(e.target.value);
              }}
              type="text"
              placeholder="Recipient Solana address"
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelTransfer}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              submitRecipientPublicKey(recipientPublicKey);
            }}
          >
            Send
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
