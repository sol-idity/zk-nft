"use client";

import { MintZkNftSection } from "@/features/mint-zk-nft/components/MintZkNftSection";
import { ZkNfts } from "@/features/zk-nft-holdings/components/ZkNfts";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { publicKey } = useWallet();
  // const [open, setOpen] = useState(true);

  return (
    <>
      {/* <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mint Paused</DialogTitle>
            <DialogDescription>
              Minting has been temporarily paused due to the hitting of RPC
              limits. Our team is working on optimizing some of the RPC calls to
              resolve this issue. Once those improvements are in place, minting
              will resume. Thank you for your patience!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog> */}
      <main className="flex min-h-full flex-col items-center px-4 py-8">
        <div className="w-full flex-1 max-w-5xl flex flex-col items-stretch">
          <div className="flex justify-between">
            <div className="hidden sm:block text-center text-3xl font-bold">
              Zero Knowledge NFT
            </div>
            <WalletMultiButtonDynamic />
          </div>
          <div className="space-y-8 mt-4">
            <MintZkNftSection />
            {publicKey && <ZkNfts />}
          </div>
        </div>
      </main>
    </>
  );
}
