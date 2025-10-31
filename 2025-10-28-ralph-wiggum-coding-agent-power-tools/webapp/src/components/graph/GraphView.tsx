"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeProps,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import {
  type DependencyGraphData,
  getDependencyGraph,
} from "@/app/actions/todos";
import type { List, TodoPriority, TodoStatus } from "@/generated/prisma";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { useCallback, useEffect, useState } from "react";
import TodoNode, { type TodoNodeData } from "./TodoNode";

const nodeTypes = {
  todo: TodoNode,
};

interface GraphViewProps {
  lists: List[];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 150;

const getLayoutedElements = (
  nodes: Node<TodoNodeData>[],
  edges: Edge[],
  direction = "TB",
): { nodes: Node<TodoNodeData>[]; edges: Edge[] } => {
  const _isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

  for (const node of nodes) {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  }

  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  const layoutedNodes: Node<TodoNodeData>[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function GraphView({ lists }: GraphViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TodoNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus | "">("");
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority | "">(
    "",
  );
  const [graphData, setGraphData] = useState<DependencyGraphData | null>(null);
  const { fitView } = useReactFlow();

  const fetchGraphData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getDependencyGraph({
        listId: selectedListId || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
      });

      if (!result.success || !result.data) {
        setError(result.error || "Failed to load dependency graph");
        return;
      }

      setGraphData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [selectedListId, selectedStatus, selectedPriority]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  useEffect(() => {
    if (!graphData) return;

    const initialNodes: Node<TodoNodeData>[] = graphData.nodes.map((node) => ({
      id: node.id,
      type: "todo",
      position: { x: 0, y: 0 },
      data: node,
    }));

    const initialEdges: Edge[] = graphData.edges.map((edge, idx) => ({
      id: `e${edge.source}-${edge.target}-${idx}`,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#6b7280", strokeWidth: 2 },
      markerEnd: {
        type: "arrowclosed" as const,
        color: "#6b7280",
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 100);
  }, [graphData, setNodes, setEdges, fitView]);

  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  const handleRelayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 100);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading dependency graph...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-red-800 dark:text-red-400 font-medium mb-2">
          Error Loading Graph
        </h3>
        <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        <button
          type="button"
          onClick={fetchGraphData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="list-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by List
            </label>
            <select
              id="list-filter"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            >
              <option value="">All Lists</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TodoStatus)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            >
              <option value="">All Statuses</option>
              <option value="TODO">TODO</option>
              <option value="DOING">DOING</option>
              <option value="DONE">DONE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="priority-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Priority
            </label>
            <select
              id="priority-filter"
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value as TodoPriority)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="NONE">None</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRelayout}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Re-layout
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            <strong>{nodeCount}</strong> todo{nodeCount !== 1 ? "s" : ""}
          </span>
          <span>•</span>
          <span>
            <strong>{edgeCount}</strong> dependenc
            {edgeCount !== 1 ? "ies" : "y"}
          </span>
        </div>
      </div>

      <div className="h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        {nodeCount === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No todos found with the selected filters
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Try adjusting your filters or create some todos with
                dependencies
              </p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes as never}
            fitView
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              className="bg-gray-50 dark:bg-gray-900"
            />
            <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
            <MiniMap
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              nodeColor={(node) => {
                const data = node.data as TodoNodeData;
                if (data.status === "DONE") return "#10b981";
                if (data.status === "DOING") return "#3b82f6";
                if (data.status === "CANCELLED") return "#ef4444";
                return "#6b7280";
              }}
            />
          </ReactFlow>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-blue-900 dark:text-blue-300 font-medium mb-2 text-sm">
          💡 How to use the Dependency Graph
        </h4>
        <ul className="text-blue-800 dark:text-blue-400 text-sm space-y-1 list-disc list-inside">
          <li>
            Use filters above to focus on specific lists, statuses, or
            priorities
          </li>
          <li>
            Arrows show dependencies - they point from blocker to blocked todos
          </li>
          <li>Drag nodes to rearrange, or use "Re-layout" to reset</li>
          <li>Use mouse wheel or controls to zoom in/out</li>
          <li>Mini-map in bottom-right helps navigate large graphs</li>
          <li>
            Node colors indicate status: Gray (TODO), Blue (DOING), Green
            (DONE), Red (CANCELLED)
          </li>
        </ul>
      </div>
    </div>
  );
}
