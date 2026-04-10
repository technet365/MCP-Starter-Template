<div align="center">

# 🚀 MCP Starter Template

**Build MCP servers in minutes, not hours**

[![CI](https://github.com/technet365/MCP-Starter-Template/actions/workflows/ci.yml/badge.svg)](https://github.com/technet365/MCP-Starter-Template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-2025--03--26-green.svg)](https://modelcontextprotocol.io/)

</div>

---

## What is this?

A minimal, production-ready TypeScript template for building [Model Context Protocol](https://modelcontextprotocol.io/) servers. Clone, add your tools, deploy.

**Includes:**
- TypeScript + ESM setup
- Docker-ready with health checks
- Auth token support
- Rate limiting
- Sensitive data sanitization in logs
- CI/CD workflow
- Example tools to learn from

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/technet365/MCP-Starter-Template.git my-mcp-server
cd my-mcp-server
npm install
```

### 2. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

### 3. Test

```bash
curl http://localhost:3000/health
```

## Create Your First Tool

### Step 1: Create the tool file

```typescript
// src/tools/weather.ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerWeatherTool(server: McpServer) {
  server.tool(
    "get_weather",                          // Tool name
    "Get current weather for a city",       // Description
    {
      city: z.string().describe("City name"),
    },
    async ({ city }) => {
      // Your logic here
      const weather = { city, temp: 22, condition: "sunny" };
      
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(weather, null, 2),
        }],
      };
    }
  );
}
```

### Step 2: Register it

```typescript
// src/tools/index.ts
import { registerWeatherTool } from "./weather.js";

export function registerAllTools(server: McpServer) {
  registerHelloTool(server);
  registerCalculatorTool(server);
  registerWeatherTool(server);  // Add this
}
```

### Step 3: Test

Restart the server and your tool is available!

## Project Structure

```
src/
├── index.ts          # HTTP server, auth, rate limiting
├── server.ts         # MCP server factory
├── logger.ts         # Logger with sensitive data redaction
└── tools/
    ├── index.ts      # Tool registry
    ├── hello.ts      # Example: simple tool
    └── calculator.ts # Example: tool with validation
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |
| `MCP_AUTH_TOKEN` | — | If set, requires Bearer token auth |
| `RATE_LIMIT_MAX` | `120` | Max requests per minute per IP |

## Docker

```bash
# Build
docker build -t my-mcp-server .

# Run
docker run -p 3000:3000 my-mcp-server
```

Or with docker-compose:

```bash
cp .env.example .env
docker compose up -d
```

## Connect to Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Example Projects

Built with this template:
- [TastyScanner MCP Server](https://github.com/technet365/TastyScanner-MCP-Server) — AI-powered options trading

## License

[MIT](LICENSE) © 2025 [technet365](https://github.com/technet365)
