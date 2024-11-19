const express = require("express");
const app = express();
app.use(express.json()); // Middleware to parse JSON data

// Webhook endpoint
app.post("/vision-webhook", (req, res) => {
  console.log("Received webhook:", req.body);
  // Process the webhook data
  res.status(200).send("Webhook received");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
