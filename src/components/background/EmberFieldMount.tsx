"use client";

import dynamic from "next/dynamic";

/** Client gate: `ssr: false` is disallowed in Server Components (layout). */
const EmberField = dynamic(() => import("./EmberField"), { ssr: false });

export default function EmberFieldMount() {
  return <EmberField />;
}
