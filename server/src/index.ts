import express from "express";
import cors from "cors";

const app = express(),
  // oxlint-disable-next-line no-magic-numbers
  PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
