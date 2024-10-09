import type { Metadata } from "next";
import React from "react";

import SiteHeader from "@/components/common/SiteHeader";

import { siteConfig } from "../config/site";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-full overflow-x-hidden overflow-y-auto">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {/* <SiteFooter /> */}
    </div>
  );
}
