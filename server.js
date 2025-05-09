const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

// Enable CORS
app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Middleware to parse incoming JSON
app.use(express.json());

// Store received webhook data by type
let webhookData = {
  logs: [],
  events: {},
  alarms: []
};

// Create server and attach socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Webhook endpoint for general data
app.post("/vision-webhook", (req, res) => {
  console.log("Received webhook:", req.body);

  // Emit data to the React frontend using WebSocket
  io.emit("webhookData", req.body);

  // Store the webhook data
  webhookData.events = req.body;

  res.status(200).send("Webhook received successfully");
});

// Webhook endpoint specifically for logs
app.post("/vision-webhook/logs", (req, res) => {
  console.log("Received log webhook:", req.body);
  
  if (req.body.logger) {
    // Add timestamp if not present
    if (!req.body.logger.timestamp) {
      req.body.logger.timestamp = new Date().toISOString();
    }
    
    // Store log in our array (limit to last 100 logs)
    webhookData.logs.push(req.body);
    if (webhookData.logs.length > 100) {
      webhookData.logs.shift();
    }
    
    // Emit log data to connected clients
    io.emit("system/logs", req.body);
  }
  
  res.status(200).send("Log webhook received successfully");
});

// Webhook endpoint for alarms/events
app.post("/vision-webhook/events", (req, res) => {
  console.log("Received event webhook:", req.body);
  
  // Store and emit event data
  webhookData.alarms.push(req.body);
  io.emit("events/status", req.body);
  
  res.status(200).send("Event webhook received successfully");
});

// Endpoint to fetch all webhook data
app.get("/webhook-data", (req, res) => {
  res.json(webhookData); // Send all stored webhook data
});

// Endpoint to fetch only logs
app.get("/webhook-data/logs", (req, res) => {
  res.json(webhookData.logs);
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("New client connected");
  
  // Send initial data to newly connected clients
  socket.emit("initialData", webhookData);
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server with WebSocket support
server.listen(3000, () => {
  console.log(`Webhook server with WebSocket running at http://localhost:3000`);
});
