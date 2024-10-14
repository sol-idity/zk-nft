import { DialogsContext } from "@/features/dialogs/providers/DialogsProvider";
import { Button } from "@/shadcn/components/ui/button";
import { useContext, useState } from "react";
import { Loader2 } from "lucide-react";
import { useZkNftProgram } from "@/common/hooks/useZkNftProgram";
import {
  CompressedAccountWithMerkleContext,
  LightSystemProgram,
  bn,
  buildTx,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  packCompressedAccounts,
} from "@lightprotocol/stateless.js";
import {
  ComputeBudgetProgram,
  PublicKey,
  SendTransactionError,
  SystemProgram,
} from "@solana/web3.js";
import * as borsh from "borsh";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { assetSchemaV1 } from "@zk-nft/program";
import { useUserBaseAssets } from "../hooks/useUserBaseAssets";
import { BaseAsset } from "@/common/types";
import { backOff } from "exponential-backoff";

export const TransferButton = ({ baseAsset }: { baseAsset: BaseAsset }) => {
  const { getRecipientPublicKey } = useContext(DialogsContext);
  const [loading, setLoading] = useState(false);
  const zkNftProgram = useZkNftProgram();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { mutate } = useUserBaseAssets(publicKey?.toBase58());

  return (
    <Button
      disabled={loading}
      variant="outline"
      className="w-full"
      onClick={async () => {
        if (!zkNftProgram || !publicKey || !signTransaction) {
          return;
        }

        const rpc = createRpc(
          connection.rpcEndpoint,
          connection.rpcEndpoint.startsWith("http://")
            ? undefined
            : connection.rpcEndpoint,
          undefined,
          {
            commitment: connection.commitment,
          }
        );

        const recipientPublicKey = await getRecipientPublicKey();
        if (!recipientPublicKey) {
          return;
        }

        try {
          setLoading(true);

          const getTx = async () => {
            // eslint-disable-next-line no-constant-condition
            while (true) {
              try {
                const assetAddress = new PublicKey(baseAsset.address);
                const assetHash = baseAsset.hash;

                const addressTree = defaultTestStateTreeAccounts().addressTree;
                const addressQueue =
                  defaultTestStateTreeAccounts().addressQueue;
                const merkleTree = defaultTestStateTreeAccounts().merkleTree;
                const nullifierQueue =
                  defaultTestStateTreeAccounts().nullifierQueue;
                const assetProof = await backOff(
                  () =>
                    rpc.getValidityProofV0(
                      [
                        {
                          hash: bn(Uint8Array.from(assetHash)),
                          tree: addressTree,
                          queue: addressQueue,
                        },
                      ],
                      undefined
                    ),
                  {
                    startingDelay: 1000,
                  }
                );
                const inputCompressedAccount: CompressedAccountWithMerkleContext =
                  {
                    merkleTree,
                    nullifierQueue,
                    hash: assetHash,
                    leafIndex: baseAsset.leafIndex,
                    readOnly: false,
                    owner: baseAsset.owner,
                    lamports: baseAsset.lamports,
                    address: Array.from(assetAddress.toBytes()),
                    data: baseAsset.data,
                  };
                const { packedInputCompressedAccounts, remainingAccounts } =
                  packCompressedAccounts(
                    [inputCompressedAccount],
                    assetProof.rootIndices,
                    []
                  );
                if (!packedInputCompressedAccounts[0]) {
                  throw new Error("Failed to pack input compressed accounts");
                }

                const decodedAsset: any = borsh.deserialize(
                  assetSchemaV1,
                  baseAsset.data.data
                );
                const {
                  accountCompressionAuthority,
                  noopProgram,
                  registeredProgramPda,
                  accountCompressionProgram,
                } = defaultStaticAccountsStruct();
                const ix = await zkNftProgram.methods
                  .transfer(
                    {
                      a: assetProof.compressedProof.a,
                      b: assetProof.compressedProof.b,
                      c: assetProof.compressedProof.c,
                    },
                    null,
                    {
                      leafIndex: baseAsset.leafIndex,
                      merkleTreePubkeyIndex:
                        packedInputCompressedAccounts[0].merkleContext
                          .merkleTreePubkeyIndex,
                      nullifierQueuePubkeyIndex:
                        packedInputCompressedAccounts[0].merkleContext
                          .nullifierQueuePubkeyIndex,
                      queueIndex:
                        packedInputCompressedAccounts[0].merkleContext
                          .queueIndex,
                    },
                    packedInputCompressedAccounts[0].rootIndex,
                    Array.from(assetAddress.toBytes()),
                    {
                      initializedPlugins: decodedAsset.initializedPlugins,
                      owner: publicKey,
                    }
                  )
                  .accounts({
                    payer: publicKey,
                    authority: publicKey,
                    systemProgram: SystemProgram.programId,
                    cpiAuthorityPda: PublicKey.findProgramAddressSync(
                      [Buffer.from("cpi_authority")],
                      zkNftProgram.programId
                    )[0],
                    accountCompressionAuthority,
                    accountCompressionProgram,
                    noopProgram,
                    registeredProgramPda,
                    selfProgram: zkNftProgram.programId,
                    lightSystemProgram: LightSystemProgram.programId,
                    recipient: recipientPublicKey,
                    freezeDelegate: null,
                    updateAuthority: new PublicKey(
                      Uint8Array.from(decodedAsset.updateAuthority)
                    ),
                  })
                  .remainingAccounts(
                    remainingAccounts.map((account) => ({
                      pubkey: account,
                      isSigner: false,
                      isWritable: true,
                    }))
                  )
                  .instruction();

                const blockhash = await rpc.getLatestBlockhash();
                const tx = buildTx(
                  [
                    ComputeBudgetProgram.setComputeUnitLimit({
                      units: 300_000,
                    }),
                    ix,
                  ],
                  publicKey,
                  blockhash.blockhash
                );

                return {
                  tx,
                  blockhash,
                };
              } catch (e) {
                console.warn(`Error occurred: ${e}. Retrying in 1000ms...`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          };

          const { tx, blockhash } = await getTx();
          const signedTx = await signTransaction(tx as any);
          const txSig = await connection.sendTransaction(signedTx);
          const confirmedTx = await connection.confirmTransaction({
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
            signature: txSig,
          });
          if (confirmedTx.value.err) {
            throw new Error(JSON.stringify(confirmedTx.value.err, null, 2));
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
          mutate();
          toast.success("Transfer successful!");
        } catch (error) {
          if (error instanceof SendTransactionError) {
            toast.error(await error.getLogs(connection));
          } else if (error instanceof Error) {
            toast.error(error.message);
          }
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading ? "Transfer" : "Sending..."}
    </Button>
  );
};
