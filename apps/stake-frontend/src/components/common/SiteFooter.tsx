import React from "react";

export default function SiteFooter() {
  return (
    <footer className="flex items-center shadow-sm w-full py-6 px-0">
      <div className="container max-w-screen-2xl">
        <div className="flex flex-row items-center justify-end">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="https://tinys.pl"
              target="_blank"
              rel="follow"
              className="font-medium underline underline-offset-4"
            >
              TinySPL
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
