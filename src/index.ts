#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerRecursiveFlow } from "./workflows/recursiveFlow/index";

async function main() {
    const server = new McpServer({
        name: "mcp-recursive-flow-server",
        version: "1.0.0",
    });

    // Register the recursiveFlow workflow and its tools
    registerRecursiveFlow(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Recursive Flow server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
