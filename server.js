const express = require("express");
const app = express();
app.use(express.json()); // Middleware to parse JSON data
const cors = require("cors");
app.use(cors()); // Allow all domains or configure as needed
let webhookData = {}; // Store the received webhook data temporarily

// Webhook endpoint
app.post("/vision-webhook", (req, res) => {
  console.log("Received webhook:", req.body);
  webhookData = req.body; // Store webhook data
  res.status(200).send("Webhook received");
});

// Endpoint to fetch the data for React to consume
app.get("/webhook-data", (req, res) => {
  res.json(webhookData); // Send stored webhook data as response
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
