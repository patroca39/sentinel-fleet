"use client";

import React from "react";
import { VChart } from "@visactor/react-vchart";

export function FleetCpkGauge({ score = 0 }) {
  // Defensive Frontend rule: guarantee input is sanitized
  const safeScore = typeof score === "number" && !isNaN(score) ? score : 0;

  // Determine dynamic accent pointer/gauge fill matching health-color constraints
  const getGaugeColor = (val) => {
    if (val < 40) return "#EF4444"; // Rose (poor/alert)
    if (val < 75) return "#F59E0B"; // Amber (warning)
    return "#22C55E"; // Emerald (optimal)
  };

  const accentColor = getGaugeColor(safeScore);

  const spec = {
    type: "gauge",
    data: [
      {
        id: "gaugeData",
        values: [
          {
            value: safeScore,
            name: "Performance Ratio",
          },
        ],
      },
    ],
    categoryField: "name",
    valueField: "value",
    outerRadius: 0.85,
    innerRadius: 0.65,
    startAngle: -210,
    endAngle: 30,
    pointer: {
      visible: true,
      style: {
        fill: accentColor,
        width: 10,
        height: 50,
      },
    },
    indicator: {
      visible: true,
      title: {
        visible: true,
        field: "value",
        style: {
          fontSize: 28,
          fill: "#FFFFFF",
          fontWeight: "bold",
        },
      },
      content: {
        visible: true,
        style: {
          text: "Performance Score",
          fontSize: 12,
          fill: "#94A3B8",
        },
      },
    },
    color: [accentColor],
  };

  return (
    <div className="w-full h-64 flex justify-center items-center">
      <VChart spec={spec} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
