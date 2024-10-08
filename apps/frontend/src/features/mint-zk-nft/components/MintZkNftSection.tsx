import { useWallet } from "@solana/wallet-adapter-react";
import { MintZkNftButton } from "./MintZkNftButton";

/* eslint-disable @next/next/no-img-element */
export const MintZkNftSection = () => {
  const { publicKey } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center w-full gap-7">
      {/* <img
        width={512}
        height={512}
        className="shadow-2xl rounded-xl"
        src="/gallery.gif"
      /> */}
      {!publicKey ? (
        <div className="flex justify-center items-center flex-1 w-full">
          <p className="font-semibold">
            Connect your wallet to mint/view your zkNFTs!
          </p>
        </div>
      ) : (
        <MintZkNftButton />
      )}
    </div>
  );
};
