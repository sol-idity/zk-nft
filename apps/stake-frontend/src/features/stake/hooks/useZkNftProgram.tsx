import { Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { idl, PROGRAM_ID, ZkNft } from "@zk-nft/program";
import { useMemo } from "react";

const KEYPAIR = Keypair.generate();

export const useZkNftProgram = () => {
  const { connection } = useConnection();

  const program = useMemo(() => {
    return new Program(idl as unknown as ZkNft, PROGRAM_ID, {
      connection,
      publicKey: KEYPAIR.publicKey,
    });
  }, [connection]);

  return program;
};
