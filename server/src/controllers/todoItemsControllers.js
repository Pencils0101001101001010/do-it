const pool = require("../db.js");
const { getAccessLevel } = require("./todoListController.js");

exports.getItems = async (req, res, next) => {};

exports.createItems = async (req, res, next) => {
  const { id } = req.params; //List id

  const access = await getAccessLevel(id, req.userId);
  //   console.log(`List id ${id} and user requesting it ${req.userId}`);
  if (!access) return res.status(404).json({ error: "List not found." });
  if (access === "viewer") {
    return res.status(403).json({ error: "Read-only access." });
  }
  //   const { description, is_done, title } = req.body;
  console.log(description, is_done, title);
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

exports.updateItem = async (req, res, next) => {};

exports.deleteItem = async (req, res, next) => {};
