"use client";

import React from "react";
import { VChart } from "@visactor/react-vchart";

interface FuelPoint {
  date?: string;
  efficiency?: number;
}

interface LineProps {
  data?: FuelPoint[];
}

export const FuelEfficiencyLine: React.FC<LineProps> = ({ data }) => {
  // STRICT Defensive Frontend rule: Validate input type, protect mapping, and provide fallbacks
  const safeData = Array.isArray(data)
    ? data
        .map((point) => {
          if (!point || typeof point !== "object") return null;
          return {
            date: typeof point.date === "string" ? point.date : "N/A",
            efficiency: typeof point.efficiency === "number" && !isNaN(point.efficiency) ? point.efficiency : 0,
          };
        })
        .filter((item): item is { date: string; efficiency: number } => item !== null)
    : [];

  // Fallback state rendering if data array is empty or corrupt
  const finalValues = safeData.length > 0 
    ? safeData 
    : [
        { date: "W1", efficiency: 10 },
        { date: "W2", efficiency: 12 },
        { date: "W3", efficiency: 11 },
        { date: "W4", efficiency: 14 }
      ];

  const spec = {
    type: "common",
    data: [
      {
        id: "fuelValues",
        values: finalValues,
      },
    ],
    series: [
      {
        type: "line",
        dataId: "fuelValues",
        xField: "date",
        yField: "efficiency",
        style: {
          line: {
            stroke: "#22C55E", // Emerald Accent
            lineWidth: 3,
          },
          point: {
            stroke: "#22C55E",
            fill: "#1E293B",
            lineWidth: 2,
            size: 6,
          },
        },
        area: {
          visible: true,
          style: {
            fill: {
              gradient: "linear",
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
              stops: [
                { offset: 0, color: "#22C55E", opacity: 0.35 },
                { offset: 1, color: "#0F172A", opacity: 0.05 },
              ],
            },
          },
        },
      },
    ],
    axes: [
      {
        orient: "left",
        label: {
          style: {
            fill: "#94A3B8",
          },
        },
        grid: {
          visible: true,
          style: {
            stroke: "#334155",
            lineDash: [4, 4],
          },
        },
      },
      {
        orient: "bottom",
        label: {
          style: {
            fill: "#94A3B8",
          },
        },
      },
    ],
    tooltip: {
      visible: true,
      activeTrigger: "hover",
    },
  };

  return (
    <div className="w-full h-64">
      <VChart spec={spec} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
