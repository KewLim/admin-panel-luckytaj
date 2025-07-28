const express = require("express");
const app = express();

app.use(express.json());

app.get("/test", (req, res) => {
    res.json({ message: "Server is working" });
});

app.post("/api/metrics/track/view", (req, res) => {
    console.log("Received metrics request:", req.body);
    res.json({ success: true, message: "Metrics tracked successfully" });
});

const PORT = 3002;
app.listen(PORT, "127.0.0.1", () => {
    console.log(`Test server running on http://localhost:${PORT}`);
});
