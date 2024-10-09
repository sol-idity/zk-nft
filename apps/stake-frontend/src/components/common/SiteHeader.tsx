import React from "react";

import { AppWalletMultiButton } from "./AppWalletMultiButton";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center shadow-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div />
        {/* <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
          <Image
            src="/logo.png"
            alt="TinySPL marketplace"
            width={20}
            height={20}
          />
          <span className="hidden font-bold lg:inline-block">TinySPL</span>
        </Link> */}
        <AppWalletMultiButton />
      </div>
    </header>
  );
}
