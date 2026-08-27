const pool = require("../db.js");
const { getAccessLevel } = require("./todoListController.js");

exports.getItems = async (req, res, next) => {
  const { id } = req.params; //list id
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  const access = await getAccessLevel(id, userId);
  if (!access) return res.status(404).json({ error: "List not found" });

  try {
    const result = await pool.query(
      "SELECT * FROM todo_items WHERE list_id = $1 ORDER BY created_at",
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createItems = async (req, res, next) => {
  const { id } = req.params; //List id

  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const access = await getAccessLevel(id, req.userId);
  //   console.log(`List id ${id} and user requesting it ${req.userId}`);
  if (!access) return res.status(404).json({ error: "List not found." });
  if (access === "viewer") {
    return res.status(403).json({ error: "Read-only access." });
  }
  const { description, is_done, title } = req.body;
  //   console.log(description, is_done, title);
  try {
    const result = await pool.query(
      "INSERT INTO todo_items (list_id, description, is_done, title) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, description, is_done, title],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  const { id, itemId } = req.params; //id = list_id, itemId = the specific item
  const { description, is_done, title } = req.body;
  const userId = req.userId;
  console.log(`list id: ${id} \n item id: ${itemId}`);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const access = await getAccessLevel(id, userId);

  if (!access) {
    return res.status(404).json({ error: "Couldn't find list" });
  }
  if (access === "viewer")
    return res.status(403).json({ error: "Read-only access" });

  try {
    const result = await pool.query(
      "UPDATE todo_items SET description = COALESCE($1, description), is_done = COALESCE($2, is_done), title = COALESCE($3, title) WHERE id = $4 AND list_id = $5 RETURNING *",
      [description, is_done, title, itemId, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {};
