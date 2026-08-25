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

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateListName = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params;
  const { name } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required." });
  }

  try {
    const result = await pool.query(
      "UPDATE todo_list SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [name.trim(), id, userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "List not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
