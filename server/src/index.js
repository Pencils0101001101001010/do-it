const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth.js");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
