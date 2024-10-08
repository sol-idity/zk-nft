import {
  PROGRAM_ID,
  STAKE_PROGRAM_ID,
  Stake,
  ZkNft,
  idl,
  stakeIdl,
} from "@zk-nft/program";
import { Rpc } from "@lightprotocol/stateless.js";
import { Keypair } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";

export const getZkNftProgram = (rpc: Rpc) => {
  const EPHEMERAL_KEYPAIR = Keypair.generate();
  const provider: AnchorProvider = new AnchorProvider(
    rpc,
    {
      publicKey: EPHEMERAL_KEYPAIR.publicKey,
      signAllTransactions: (transactions) => Promise.resolve(transactions),
      signTransaction: (transaction) => Promise.resolve(transaction),
    },
    { commitment: "confirmed" }
  );
  const program = new Program<ZkNft>(idl as any, PROGRAM_ID, provider);
  return program;
};

export const getStakeProgram = (rpc: Rpc) => {
  const EPHEMERAL_KEYPAIR = Keypair.generate();
  const provider: AnchorProvider = new AnchorProvider(
    rpc,
    {
      publicKey: EPHEMERAL_KEYPAIR.publicKey,
      signAllTransactions: (transactions) => Promise.resolve(transactions),
      signTransaction: (transaction) => Promise.resolve(transaction),
    },
    { commitment: "confirmed" }
  );
  const program = new Program<Stake>(
    stakeIdl as any,
    STAKE_PROGRAM_ID,
    provider
  );
  return program;
};
