import "dotenv/config";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/server";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { z } from "zod";
import { getCreditcoinReputation } from "./creditcoin.js";

const mcpServer = new McpServer({
  name: "creditcoin-reputation",
  version: "0.1.0",
});

mcpServer.registerTool(
  "get_creditcoin_reputation",
  {
    title: "Get Creditcoin Reputation",
    description:
      "Retrieve the real on-chain Creditcoin reputation for an Ethereum-compatible wallet address.",
    inputSchema: {
      walletAddress: z
        .string()
        .describe("The Ethereum-compatible wallet address to inspect."),
    },
  },
  async ({ walletAddress }) => {
    try {
      const reputation = await getCreditcoinReputation(walletAddress);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(reputation, null, 2),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      return {
        content: [
          {
            type: "text" as const,
            text: `Unable to retrieve Creditcoin reputation: ${message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

const transports = new Map<string, NodeStreamableHTTPServerTransport>();

const port = Number(process.env.MCP_PORT ?? 3000);

const httpServer = createServer(async (req, res) => {
  try {
    if (req.url !== "/mcp") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport: NodeStreamableHTTPServerTransport | undefined;

    if (sessionId) {
      transport = transports.get(sessionId);

      if (!transport) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("MCP session not found");
        return;
      }

      await transport.handleRequest(req, res);
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("MCP initialization requires POST");
      return;
    }

    transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    transport.onclose = () => {
      const id = transport?.sessionId;
      if (id) {
        transports.delete(id);
      }
    };

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res);

    const newSessionId = transport.sessionId;

    if (newSessionId) {
      transports.set(newSessionId, transport);
      console.log(`MCP session created: ${newSessionId}`);
    }
  } catch (error) {
    console.error("MCP HTTP error:", error);

    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal MCP server error");
    }
  }
});

httpServer.listen(port, "127.0.0.1", () => {
  console.log("Creditcoin Reputation MCP server initialized.");
  console.log("Tool: get_creditcoin_reputation");
  console.log(`MCP endpoint: http://127.0.0.1:${port}/mcp`);
});
