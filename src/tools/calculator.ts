// ============================================================================
// Example Tool: Calculator
// A tool demonstrating multiple parameters and validation
// ============================================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../logger.js";

export function registerCalculatorTool(server: McpServer) {
  server.tool(
    "calculate",
    "Perform basic math operations: add, subtract, multiply, divide.",
    {
      operation: z
        .enum(["add", "subtract", "multiply", "divide"])
        .describe("The math operation to perform"),
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
    async ({ operation, a, b }) => {
      logger.info(`[Tool] calculate: ${a} ${operation} ${b}`);

      let result: number;
      let symbol: string;

      switch (operation) {
        case "add":
          result = a + b;
          symbol = "+";
          break;
        case "subtract":
          result = a - b;
          symbol = "-";
          break;
        case "multiply":
          result = a * b;
          symbol = "×";
          break;
        case "divide":
          if (b === 0) {
            return {
              content: [{ type: "text" as const, text: "Error: Division by zero" }],
              isError: true,
            };
          }
          result = a / b;
          symbol = "÷";
          break;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              expression: `${a} ${symbol} ${b}`,
              result,
            }, null, 2),
          },
        ],
      };
    }
  );
}
