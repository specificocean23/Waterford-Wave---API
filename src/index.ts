/**
 * API & Background Jobs Server - Waterford Wave
 * 
 * For future API endpoints, scheduled jobs, webhooks, etc.
 * Currently just a placeholder with health check.
 */

import express from "express";
import cors from "cors";
import { config } from "dotenv";
import prisma from "./db.js";

config();

const PORT = parseInt(process.env.PORT || "8080", 10);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", async (_req, res) => {
    let dbOk = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true;
    } catch (e) {
        console.error("DB check failed:", e);
    }

    res.json({
        status: dbOk ? "healthy" : "degraded",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Root endpoint
app.get("/", (_req, res) => {
    res.json({
        service: "API Server",
        status: "running",
        version: "1.0.0",
    });
});

// Future API endpoints go here...
// Example:
// app.post("/api/notifications/send", async (req, res) => {
//   // Send push notifications
// });
//
// app.post("/api/jobs/cleanup-old-messages", async (req, res) => {
//   // Background job to clean old messages
// });

// Graceful shutdown
const shutdown = async () => {
    console.log("\n🛑 Shutting down...");
    await prisma.$disconnect();
    process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 API Server`);
    console.log(`🌐 HTTP: http://0.0.0.0:${PORT}`);
    console.log(`💚 Health: http://0.0.0.0:${PORT}/health\n`);
});
