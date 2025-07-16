"use client";
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useEffect } from "react";

// import { SiteHeader } from "./chat/components/site-header";
// import { Jumbotron } from "./landing/components/jumbotron";
// import { Ray } from "./landing/components/ray";
// import { CaseStudySection } from "./landing/sections/case-study-section";
// import { CoreFeatureSection } from "./landing/sections/core-features-section";
// import { JoinCommunitySection } from "./landing/sections/join-community-section";
// import { MultiAgentSection } from "./landing/sections/multi-agent-section";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/chat");
  }, [router]);
  return null;
}

function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="container mt-32 flex flex-col items-center justify-center">
      <hr className="from-border/0 via-border/70 to-border/0 m-0 h-px w-full border-none bg-gradient-to-r" />
      <div className="text-muted-foreground container flex h-20 flex-col items-center justify-center text-sm">
      </div>
      <div className="text-muted-foreground container mb-8 flex flex-col items-center justify-center text-xs">
      </div>
    </footer>
  );
}
