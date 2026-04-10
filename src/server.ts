// ============================================================================
// MCP Server Factory
// Creates a new MCP server instance with all tools registered
// ============================================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index.js";

const SERVER_NAME = process.env.MCP_SERVER_NAME ?? "mcp-starter";
const SERVER_VERSION = process.env.MCP_SERVER_VERSION ?? "1.0.0";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register all tools
  registerAllTools(server);

  return server;
}
