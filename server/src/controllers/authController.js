const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db.js");

const SALT_ROUNDS = 12;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

exports.register = async (req, res, next) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password || password.length < 8) {
    return res.status(400).json({
      error:
        "All fields are required and password must be more than 8 characters.",
    });
  }

  try {
    const exist = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (exist.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const userResult = await client.query(
        "INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email",
        [name, username, email, hashPassword],
      );

      const user = userResult.rows[0];
      await client.query("COMMIT");

      const token = signToken(user.id);
      res.status(201).json({ token, user });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [
    req.userId,
  ]);
  if (result.rows.length === 0)
    return res.status(404).json({ error: "User not found." });
  res.json({ user: result.rows[0] });
};
