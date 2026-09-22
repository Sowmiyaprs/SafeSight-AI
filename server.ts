import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import http from "http";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const FLASK_PORT = 5000;

  app.use(express.json());

  // Static evidence directories
  const violationsDir = path.join(__dirname, "static", "violations");
  app.use("/api/evidence", express.static(violationsDir));
  app.use("/static", express.static(path.join(__dirname, "static")));

  // 1. Streaming Proxy (Pipes MJPEG from Python YOLOv8 detector to browser)
  app.get("/api/stream", (req, res) => {
    const proxyReq = http.request({
      hostname: "127.0.0.1",
      port: FLASK_PORT,
      path: "/api/stream",
      method: "GET",
      headers: req.headers,
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", () => {
      res.status(503).json({ error: "Python AI stream not running on port 5000. Start python backend/app.py" });
    });

    proxyReq.end();
  });

  // Helper to forward API request to Python backend or fallback to local handler
  const forwardOrFallback = (pathUrl: string, fallbackFn: (req: express.Request, res: express.Response) => void) => {
    return (req: express.Request, res: express.Response) => {
      const proxyReq = http.request({
        hostname: "127.0.0.1",
        port: FLASK_PORT,
        path: pathUrl,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${FLASK_PORT}`,
        },
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on("error", () => {
        // Fallback when Flask backend is not yet started
        fallbackFn(req, res);
      });

      if (req.body && Object.keys(req.body).length > 0) {
        proxyReq.write(JSON.stringify(req.body));
      }
      proxyReq.end();
    };
  };

  // Fallback Data
  const getLocalViolations = () => {
    try {
      if (fs.existsSync(violationsDir)) {
        const files = fs.readdirSync(violationsDir).filter(f => f.endsWith(".jpg"));
        if (files.length > 0) {
          return files.slice(0, 50).map((fname, idx) => ({
            id: `V-${1000 + idx}`,
            time: new Date(fs.statSync(path.join(violationsDir, fname)).mtime).toISOString().replace('T', ' ').slice(0, 19),
            workerId: `W-${200 + (idx % 50)}`,
            type: "No Safety Helmet",
            location: idx % 2 === 0 ? "Zone A - Main Entrance" : "Zone B - Scaffolding",
            status: idx < 3 ? "Critical" : "Warning",
            thumbnail: `/api/evidence/${fname}`,
            filename: fname
          }));
        }
      }
    } catch (e) {}

    return [
      { id: 'V-101', time: '2026-03-07 09:12:45', workerId: 'W-442', type: 'No Helmet', location: 'Zone A - North Wing', status: 'Critical' },
      { id: 'V-102', time: '2026-03-07 10:05:12', workerId: 'W-129', type: 'No Helmet', location: 'Zone C - Loading Dock', status: 'Warning' },
      { id: 'V-103', time: '2026-03-07 11:30:00', workerId: 'W-883', type: 'PPE Missing', location: 'Zone B - Scaffolding', status: 'Resolved' },
    ];
  };

  const STATS = {
    totalWorkers: "1,284",
    helmetCompliance: "94.2%",
    violationsToday: "18",
    reportsGenerated: "54",
    trends: {
      workers: "+14%",
      compliance: "+2.4%",
      violations: "-5%",
      reports: "+8%"
    }
  };

  const COMPLIANCE_TREND = [
    { time: '08:00', compliance: 92 },
    { time: '09:00', compliance: 88 },
    { time: '10:00', compliance: 95 },
    { time: '11:00', compliance: 91 },
    { time: '12:00', compliance: 85 },
    { time: '13:00', compliance: 94 },
    { time: '14:00', compliance: 97 },
    { time: '15:00', compliance: 93 },
  ];

  const REPORTS = [
    { id: 'R-001', name: 'Weekly Safety Audit - Week 10', date: '2026-03-09', type: 'Safety', status: 'Ready' },
    { id: 'R-002', name: 'Monthly Insurance Compliance', date: '2026-03-01', type: 'Insurance', status: 'Ready' },
    { id: 'R-003', name: 'Zone A Incident Summary', date: '2026-03-05', type: 'Compliance', status: 'Ready' },
    { id: 'R-004', name: 'Daily Compliance Log - Mar 08', date: '2026-03-08', type: 'Safety', status: 'Ready' },
  ];

  // API Endpoints with proxy & fallback
  app.get("/api/stats", forwardOrFallback("/api/stats", (req, res) => {
    res.json({ stats: STATS, trend: COMPLIANCE_TREND });
  }));

  app.get("/api/violations", forwardOrFallback("/api/violations", (req, res) => {
    res.json(getLocalViolations());
  }));

  app.get("/api/reports", forwardOrFallback("/api/reports", (req, res) => {
    res.json(REPORTS);
  }));

  app.post("/api/violation", forwardOrFallback("/api/violation", (req, res) => {
    res.json({ success: true, message: "Violation received" });
  }));

  app.post("/api/system/toggle", forwardOrFallback("/api/system/toggle", (req, res) => {
    res.json({ status: "ACTIVE", is_running: true });
  }));

  app.post("/api/system/alarm", forwardOrFallback("/api/system/alarm", (req, res) => {
    res.json({ success: true, message: "Alarm triggered" });
  }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SafeSight Dashboard running on http://localhost:${PORT}`);
  });
}

startServer();
