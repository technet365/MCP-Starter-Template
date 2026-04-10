// ============================================================================
// Example Tool: Hello World
// A simple tool that greets the user
// ============================================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../logger.js";

export function registerHelloTool(server: McpServer) {
  server.tool(
    "hello",
    "Say hello to someone. Returns a friendly greeting.",
    {
      name: z.string().optional().describe("Name to greet (default: World)"),
    },
    async ({ name }) => {
      const greeting = `Hello, ${name || "World"}!`;
      logger.info(`[Tool] hello called with name: ${name || "(default)"}`);

      return {
        content: [
          {
            type: "text" as const,
            text: greeting,
          },
        ],
      };
    }
  );
}
