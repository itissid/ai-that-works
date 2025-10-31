"use client";

import { ReactFlowProvider } from "@xyflow/react";
import type { List } from "@/generated/prisma";
import GraphView from "./GraphView";

interface GraphViewWrapperProps {
  lists: List[];
}

export default function GraphViewWrapper({ lists }: GraphViewWrapperProps) {
  return (
    <ReactFlowProvider>
      <GraphView lists={lists} />
    </ReactFlowProvider>
  );
}
