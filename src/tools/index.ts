// ============================================================================
// Tools Registry
// Add your tools here to register them with the MCP server
// ============================================================================

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerHelloTool } from "./hello.js";
import { registerCalculatorTool } from "./calculator.js";

export function registerAllTools(server: McpServer) {
  registerHelloTool(server);
  registerCalculatorTool(server);
  
  // Add your custom tools here:
  // registerMyCustomTool(server);
}
