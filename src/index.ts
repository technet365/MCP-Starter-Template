// ============================================================================
// MCP Starter Template — Entry Point
// A minimal, production-ready MCP server
// ============================================================================

import express, { Request, Response, NextFunction } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createMcpServer } from "./server.js";
import { logger } from "./logger.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN ?? "";

// ---------------------------------------------------------------------------
// Rate Limiting (simple in-memory)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? "120", 10);
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    res.status(429).json({ error: "Too many requests" });
    return;
  }

  entry.count++;
  next();
}

// ---------------------------------------------------------------------------
// Auth Middleware
// ---------------------------------------------------------------------------

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!MCP_AUTH_TOKEN) return next();

  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token !== MCP_AUTH_TOKEN) {
    logger.warn(`[Auth] Invalid token from ${req.ip}`);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

// ---------------------------------------------------------------------------
// Session Management
// ---------------------------------------------------------------------------

const sessions = new Map<string, { transport: SSEServerTransport }>();

// ---------------------------------------------------------------------------
// Express App
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    sessions: sessions.size,
  });
});

// MCP endpoint (SSE)
app.get("/mcp", rateLimit, authMiddleware, async (req, res) => {
  logger.info(`[MCP] New SSE connection from ${req.ip}`);

  const transport = new SSEServerTransport("/mcp/messages", res);
  const server = createMcpServer();
  const sessionId = crypto.randomUUID();

  sessions.set(sessionId, { transport });

  res.on("close", () => {
    sessions.delete(sessionId);
    logger.info(`[MCP] Session ${sessionId.slice(0, 8)} closed`);
  });

  await server.connect(transport);
});

// MCP messages endpoint
app.post("/mcp/messages", rateLimit, authMiddleware, express.json(), async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const session = sessions.get(sessionId);

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await session.transport.handlePostMessage(req, res, req.body);
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  logger.info("=== MCP Starter Server ===");
  logger.info(`Port: ${PORT}`);
  logger.info(`Auth: ${MCP_AUTH_TOKEN ? "ENABLED" : "DISABLED"}`);
  logger.info(`Rate limit: ${RATE_LIMIT_MAX}/min`);
  logger.info("");
  logger.info(`Health: http://localhost:${PORT}/health`);
  logger.info(`MCP:    http://localhost:${PORT}/mcp`);
});
