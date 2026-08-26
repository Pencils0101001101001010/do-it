const pool = require("../db.js");

exports.getLists = async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  try {
    // Owned lists + lists shared with this user query
    const result = await pool.query(
      `SELECT tl.*, 'owner' AS role
       FROM todo_list tl
       WHERE tl.user_id = $1

       UNION

       SELECT tl.*, s.role
       FROM todo_list tl
       JOIN todo_list_shares s ON s.list_id = tl.id
       WHERE s.user_id = $1 AND s.status = 'accepted'`,
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
    // Owner can rename, OR a shared user with 'editor' role
    const result = await pool.query(
      `UPDATE todo_list tl
       SET name = $1
       WHERE tl.id = $2
         AND (
           tl.user_id = $3
           OR EXISTS (
             SELECT 1 FROM todo_list_shares s
             WHERE s.list_id = tl.id
               AND s.user_id = $3
               AND s.status = 'accepted'
               AND s.role = 'editor'
           )
         )
       RETURNING *`,
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

exports.deleteList = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  try {
    // Owner-only delete — sharing (even 'editor') does not grant delete rights
    const result = await pool.query(
      "DELETE FROM todo_list WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "List not found." });
    }

    res.status(200).json({ message: "List deleted." });
  } catch (error) {
    next(error);
  }
};

exports.getAccessLevel = async (ListId, userId) => {
  const ownerCheck = await pool.query(
    "SELECT id FROM todo_list WHERE id = $1 AND user_id = $2",
    [ListId, userId],
  );

  if (ownerCheck.rows.length > 0) return "owner";

  const collabCheck = await pool.query(
    "SELECT role FROM todo_list_shares WHERE list_id = $1 AND user_id = $2",
    [ListId, userId],
  );
  if (collabCheck.rows.length > 0) return collabCheck.rows[0].role;

  return null;
};
