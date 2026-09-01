const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth.js");
const listRoutes = require("./routes/todoListRoutes.js");
const itemRoutes = require("./routes/todoItemsRoutes.js");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173/",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/list", listRoutes);
app.use("/api/items", itemRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(500).json({
    error: isDev ? err.message : "Something went wrong",
  });
});

module.exports = app;
