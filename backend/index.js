require("dotenv").config();
const express = require("express");
const cors = require("cors");
const theaterRoutes = require("./routes/theaterRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes

app.use("/auth", authRoutes);
app.use("/theaters", theaterRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(port, () => console.log(`Server on port ${port}`));
