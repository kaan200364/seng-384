const express = require("express");
const cors = require("cors");
require("dotenv").config();

const peopleRoutes = require("./routes/people");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/people", peopleRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});