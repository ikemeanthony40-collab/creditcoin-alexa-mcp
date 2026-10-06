# Creditcoin Reputation — Alexa+ MCP Integration

## Amazon Developer Hackathon 2026

This project is an **Alexa+ track submission for the Amazon Developer Hackathon 2026**.

It demonstrates a self-hosted **Model Context Protocol (MCP) server** that exposes real Creditcoin reputation data through an MCP tool that can be consumed by an MCP-compatible agent experience.

The **Creditcoin reputation capability is the real-world use case**. The **hackathon-specific implementation is the self-hosted MCP server and its Streamable HTTP interface**, which makes that capability available through the Alexa+ MCP integration path.

---

## Hackathon Track

- **Hackathon:** Amazon Developer Hackathon 2026
- **Primary track:** Alexa+
- **Integration approach:** Self-hosted MCP server
- **Transport:** Streamable HTTP
- **MCP endpoint:** `/mcp`
- **MCP protocol tested:** `2025-11-25`
- **MCP tool:** `get_creditcoin_reputation`

This project uses the **self-hosted MCP server integration approach** rather than an Agent Skill.

---

## What the Project Does

The server exposes one MCP tool:

`get_creditcoin_reputation`

The tool accepts an Ethereum-compatible wallet address and retrieves Creditcoin reputation information.

The response contains:

- Wallet address
- Verified score
- Estimated score
- Total score
- Reputation tier
- Last updated timestamp

Example verified result:

    {
      "wallet": "0xcd6d115f27Dd696c4105aa2E03a2401cD46B2CC8",
      "verifiedScore": 700,
      "estimatedScore": 0,
      "totalScore": 700,
      "tier": "Gold",
      "lastUpdated": 1787293050
    }

---

## Why This Is an Amazon Hackathon Submission

The project is not simply a Creditcoin reputation application.

The hackathon contribution is the **self-hosted MCP integration layer** that exposes the Creditcoin capability through the Model Context Protocol using Streamable HTTP.

The resulting architecture is:

    Alexa+ / MCP-compatible agent
                |
                | Streamable HTTP
                v
           /mcp endpoint
                |
                v
     Creditcoin Reputation MCP Server
                |
                v
     get_creditcoin_reputation
                |
                v
        Creditcoin data source

The MCP server provides the agent-facing integration layer, while Creditcoin reputation provides the real-world capability used by the tool.

---

## MCP Implementation

The server is implemented using:

- Node.js
- TypeScript
- Model Context Protocol (MCP)
- Streamable HTTP
- Zod

The project uses the following MCP packages:

    @modelcontextprotocol/server
    @modelcontextprotocol/node

The installed MCP package versions were verified during development as:

    @modelcontextprotocol/server 2.0.0
    @modelcontextprotocol/node   2.0.0

---

## Source Code

The MCP server implementation is located at:

    src/server.ts

The Creditcoin reputation integration is located at:

    src/creditcoin.ts

The server:

1. Creates an MCP server.
2. Registers the `get_creditcoin_reputation` tool.
3. Provides a Streamable HTTP `/mcp` endpoint.
4. Creates MCP sessions.
5. Supports MCP tool discovery.
6. Supports MCP tool invocation.
7. Returns the Creditcoin reputation result to the MCP client.

---

## Verified MCP Protocol

The implementation was successfully tested using:

    MCP protocol version: 2025-11-25
    Transport: Streamable HTTP
    Endpoint: /mcp

A successful `initialize` request returned:

    {
      "result": {
        "protocolVersion": "2025-11-25",
        "capabilities": {
          "tools": {
            "listChanged": true
          }
        },
        "serverInfo": {
          "name": "creditcoin-reputation",
          "version": "0.1.0"
        }
      }
    }

The server also successfully responded to:

    tools/list

and exposed:

    get_creditcoin_reputation

The tool was then successfully invoked using:

    tools/call

and returned a real Creditcoin reputation result.

---

## Example MCP Request

A tool invocation uses the following JSON-RPC structure:

    {
      "jsonrpc": "2.0",
      "id": 3,
      "method": "tools/call",
      "params": {
        "name": "get_creditcoin_reputation",
        "arguments": {
          "walletAddress": "0xcd6d115f27Dd696c4105aa2E03a2401cD46B2CC8"
        }
      }
    }

The successful test returned:

    {
      "result": {
        "content": [
          {
            "type": "text",
            "text": "{\n  \"wallet\": \"0xcd6d115f27Dd696c4105aa2E03a2401cD46B2CC8\",\n  \"verifiedScore\": 700,\n  \"estimatedScore\": 0,\n  \"totalScore\": 700,\n  \"tier\": \"Gold\",\n  \"lastUpdated\": 1787293050\n}"
          }
        ]
      },
      "jsonrpc": "2.0",
      "id": 3
    }

---

## Project Structure

    alexa-mcp/
    ├── src/
    │   ├── server.ts
    │   └── creditcoin.ts
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── README.md
    └── LICENSE

---

## Installation

Install the project dependencies:

    npm install

---

## Run the MCP Server

Start the development server:

    npm run dev

The local MCP endpoint is:

    http://127.0.0.1:3000/mcp

The server listens locally on port `3000` and exposes the MCP endpoint at `/mcp`.

---

## Build

Compile the TypeScript project:

    npm run build

---

## Start the Built Server

After building:

    npm start

The MCP endpoint is:

    http://127.0.0.1:3000/mcp

---

## MCP Testing Sequence

The MCP server was tested using the following sequence:

    initialize
        |
        v
    tools/list
        |
        v
    tools/call
        |
        v
    get_creditcoin_reputation
        |
        v
    Creditcoin reputation result

The server successfully completed this sequence during local testing.

---

## Public Streamable HTTP Testing

For development testing, the local MCP server can be exposed through a Cloudflare Quick Tunnel.

Example:

    cloudflared tunnel --protocol http2 --url http://127.0.0.1:3000

Cloudflare then provides a temporary HTTPS address.

The MCP endpoint becomes:

    https://<temporary-cloudflare-host>/mcp

The public endpoint was successfully tested during development with:

    initialize
    tools/list
    tools/call

using:

    MCP protocol: 2025-11-25
    Transport: Streamable HTTP

The Cloudflare Quick Tunnel is used only for temporary development and testing. It is not a permanent production endpoint.

---

## Tool Definition

### `get_creditcoin_reputation`

**Description**

Retrieve the real on-chain Creditcoin reputation for an Ethereum-compatible wallet address.

**Input**

    {
      "walletAddress": "0x..."
    }

**Example output**

    {
      "wallet": "0xcd6d115f27Dd696c4105aa2E03a2401cD46B2CC8",
      "verifiedScore": 700,
      "estimatedScore": 0,
      "totalScore": 700,
      "tier": "Gold",
      "lastUpdated": 1787293050
    }

---

## Technical Architecture

The server uses a Node.js HTTP server together with the MCP Streamable HTTP transport.

The request flow is:

    MCP Client
        |
        | HTTP POST /mcp
        v
    Node HTTP Server
        |
        v
    NodeStreamableHTTPServerTransport
        |
        v
    McpServer
        |
        v
    get_creditcoin_reputation
        |
        v
    Creditcoin Reputation Data

MCP sessions are maintained using the `MCP-Session-Id` header.

Each initialized MCP session is associated with its corresponding Streamable HTTP transport.

---

## Verification Summary

The following functionality has been verified:

    PASS  MCP server starts successfully
    PASS  Streamable HTTP endpoint available
    PASS  MCP initialize
    PASS  MCP protocol 2025-11-25
    PASS  MCP session creation
    PASS  tools/list
    PASS  get_creditcoin_reputation discovery
    PASS  tools/call
    PASS  Creditcoin reputation response
    PASS  Public Streamable HTTP testing

Example verified result:

    Wallet:
    0xcd6d115f27Dd696c4105aa2E03a2401cD46B2CC8

    Verified Score:
    700

    Estimated Score:
    0

    Total Score:
    700

    Tier:
    Gold

---

## Hackathon Submission Summary

This project demonstrates a practical **Alexa+ MCP integration** in which a real-world Creditcoin reputation capability is exposed through a self-hosted MCP server.

The implementation demonstrates:

- A self-hosted MCP server
- Streamable HTTP transport
- MCP protocol version `2025-11-25`
- MCP session handling
- MCP tool discovery
- MCP tool invocation
- A real-world data capability exposed as an MCP tool
- Public HTTPS testing of the MCP endpoint

The core hackathon contribution is the **MCP integration layer**. Creditcoin reputation provides the concrete capability used to demonstrate that integration.

The public Cloudflare endpoint used during testing is temporary and is not part of the permanent application architecture.

---

## License

This project is released under the MIT License.

See the `LICENSE` file for the complete license text.

---

## Author

**Anthony Mbadiwe Ikeme**

Amazon Developer Hackathon 2026 — Alexa+ track
