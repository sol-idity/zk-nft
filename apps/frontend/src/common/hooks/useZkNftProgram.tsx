import { Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { PROGRAM_ID, ZkNft, idl } from "@zk-nft/program";
import useSWRImmutable from "swr/immutable";

const KEYPAIR = Keypair.generate();

export const useZkNftProgram = () => {
  const { connection } = useConnection();

  const swr = useSWRImmutable(
    ["zkNftProgram", connection.rpcEndpoint],
    () =>
      new Program(idl as unknown as ZkNft, PROGRAM_ID, {
        connection,
        publicKey: KEYPAIR.publicKey,
      })
  );

  return swr.data;
};
