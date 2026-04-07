#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "burnish-example-server",
  version: "0.1.0",
});

// --- Tool: get-project-info ---
server.tool(
  "get-project-info",
  "Returns structured project metadata suitable for rendering as a status card",
  {},
  async () => {
    const info = {
      name: "Burnish",
      version: "0.1.0",
      description:
        "Universal UI layer for MCP servers — explore, test, and visualize any MCP server with rich components",
      status: "Active",
      lastUpdated: "2026-04-05",
      contributors: 12,
      openIssues: 8,
      stars: 342,
      license: "AGPL-3.0",
      language: "TypeScript",
      repository: "https://github.com/danfking/burnish",
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(info, null, 2) }],
    };
  }
);

// --- Tool: list-users ---
server.tool(
  "list-users",
  "Returns a list of users with their roles and status, suitable for rendering as a data table",
  {},
  async () => {
    const users = [
      {
        id: 1,
        name: "Alice Chen",
        email: "alice@example.com",
        role: "Admin",
        status: "Active",
        joined: "2025-01-15",
      },
      {
        id: 2,
        name: "Bob Martinez",
        email: "bob@example.com",
        role: "Developer",
        status: "Active",
        joined: "2025-02-20",
      },
      {
        id: 3,
        name: "Carol Williams",
        email: "carol@example.com",
        role: "Designer",
        status: "Active",
        joined: "2025-03-10",
      },
      {
        id: 4,
        name: "David Kim",
        email: "david@example.com",
        role: "Developer",
        status: "Inactive",
        joined: "2025-04-05",
      },
      {
        id: 5,
        name: "Eva Singh",
        email: "eva@example.com",
        role: "PM",
        status: "Active",
        joined: "2025-05-12",
      },
      {
        id: 6,
        name: "Frank Osei",
        email: "frank@example.com",
        role: "Developer",
        status: "Active",
        joined: "2025-06-01",
      },
      {
        id: 7,
        name: "Grace Tanaka",
        email: "grace@example.com",
        role: "QA",
        status: "On Leave",
        joined: "2025-07-18",
      },
      {
        id: 8,
        name: "Henry Novak",
        email: "henry@example.com",
        role: "DevOps",
        status: "Active",
        joined: "2025-08-22",
      },
    ];

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(users, null, 2) },
      ],
    };
  }
);

// --- Tool: get-system-stats ---
server.tool(
  "get-system-stats",
  "Returns current system metrics including CPU, memory, disk usage, and connection stats",
  {},
  async () => {
    const stats = {
      cpu: { usage: 42.5, cores: 8, model: "Intel Xeon E5-2686 v4" },
      memory: { usedGb: 12.3, totalGb: 32, percentage: 38.4 },
      disk: { usedGb: 156, totalGb: 500, percentage: 31.2 },
      network: {
        activeConnections: 247,
        requestsPerSecond: 1842,
        bandwidthMbps: 450,
      },
      uptime: { days: 45, hours: 12, minutes: 33 },
      services: {
        healthy: 18,
        degraded: 2,
        down: 0,
      },
    };

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(stats, null, 2) },
      ],
    };
  }
);

// --- Tool: get-sales-data ---
server.tool(
  "get-sales-data",
  "Returns monthly sales data with categories, amounts, and trends for chart visualization",
  {},
  async () => {
    const salesData = {
      period: "2025 Q1–Q4",
      currency: "USD",
      months: [
        {
          month: "Jan",
          software: 45000,
          services: 28000,
          hardware: 12000,
          total: 85000,
        },
        {
          month: "Feb",
          software: 52000,
          services: 31000,
          hardware: 9000,
          total: 92000,
        },
        {
          month: "Mar",
          software: 49000,
          services: 35000,
          hardware: 15000,
          total: 99000,
        },
        {
          month: "Apr",
          software: 61000,
          services: 33000,
          hardware: 11000,
          total: 105000,
        },
        {
          month: "May",
          software: 58000,
          services: 40000,
          hardware: 13000,
          total: 111000,
        },
        {
          month: "Jun",
          software: 67000,
          services: 38000,
          hardware: 16000,
          total: 121000,
        },
        {
          month: "Jul",
          software: 72000,
          services: 42000,
          hardware: 14000,
          total: 128000,
        },
        {
          month: "Aug",
          software: 68000,
          services: 45000,
          hardware: 18000,
          total: 131000,
        },
        {
          month: "Sep",
          software: 75000,
          services: 41000,
          hardware: 12000,
          total: 128000,
        },
        {
          month: "Oct",
          software: 82000,
          services: 48000,
          hardware: 20000,
          total: 150000,
        },
        {
          month: "Nov",
          software: 79000,
          services: 52000,
          hardware: 17000,
          total: 148000,
        },
        {
          month: "Dec",
          software: 91000,
          services: 55000,
          hardware: 22000,
          total: 168000,
        },
      ],
      summary: {
        totalRevenue: 1466000,
        topCategory: "Software",
        growthRate: 97.6,
        averageMonthly: 122167,
      },
    };

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(salesData, null, 2) },
      ],
    };
  }
);

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Failed to start example server:", error);
  process.exit(1);
});
