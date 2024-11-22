const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from React frontend
    methods: ["GET", "POST"],
  })
);

// Middleware to parse incoming JSON
app.use(express.json());

let webhookData = {}; // Store the received webhook data temporarily

// Create server and attach socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Webhook endpoint
app.post("/vision-webhook", (req, res) => {
  console.log("Received webhook:", req.body);

  // Emit data to the React frontend using WebSocket
  io.emit("webhookData", req.body);

  // Store the webhook data
  webhookData = req.body;

  res.status(200).send("Webhook received successfully");
});

// Endpoint to fetch the data for React to consume
app.get("/webhook-data", (req, res) => {
  res.json(webhookData); // Send stored webhook data as response
});

// Start server with WebSocket support
server.listen(3000, () => {
  console.log(`Webhook server with WebSocket running at http://localhost:3000`);
});
