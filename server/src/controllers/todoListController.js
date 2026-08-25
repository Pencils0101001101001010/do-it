const pool = require("../db.js");

exports.getLists = async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM todo_list WHERE user_id = $1",
      [userId],
    );

    if (!result) {
      return res.status(400).json({ error: "Failed to fetch lists" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createList = async (req, res, next) => {
  const { name } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO todo_list (user_id, name) VALUES ($1, $2) RETURNING *",
      [userId, name || "New Todo"],
    );
    if (!result) {
      return res.status(400).json({ error: "Failed to create list." });
    }
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
