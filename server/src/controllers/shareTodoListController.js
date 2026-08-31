const { transporter } = require("../config/transporter.js");
const pool = require("../db.js");
const { getAccessLevel } = require("./todoListController.js");

exports.shareList = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params; // list id
  const { email, role } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  const access = await getAccessLevel(id, userId);
  if (access !== "owner")
    return res
      .status(403)
      .json({ error: "Only the owner can share this list" });

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // Only the owner can share the list
    const list = await pool.query(
      "SELECT id FROM todo_list WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (list.rows.length === 0) {
      return res.status(404).json({ error: "List not found." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // If a user with this email already exists, link the share immediately.
    // Otherwise it stays 'pending' until they sign up with that email.
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail],
    );

    const invitedUserId = existingUser.rows[0]?.id || null;
    const status = invitedUserId ? "accepted" : "pending";

    const result = await pool.query(
      `INSERT INTO todo_list_shares (list_id, user_id, invited_email, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (list_id, invited_email)
       DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [id, invitedUserId, normalizedEmail, role || "editor", status],
    );

    //Debug nodemailer config:
    // try {
    //   await transporter.verify();
    //   console.log("Server is ready to take our messages");
    // } catch (err) {
    //   console.error("Verification failed:", err);
    // }

    const getSendersDetails = await pool.query(
      "SELECT * FROM users WHERE id = $1 ",
      [userId],
    );

    // console.log(`Owners email: ${getSendersDetails.rows[0].email}`);

    const ownerMail = getSendersDetails.rows[0].email;
    try {
      // console.log(`Users email ${normalizedEmail}`);
      const info = await transporter.sendMail({
        from: `"DO IT!" ${ownerMail}`, // sender address
        to: `${normalizedEmail}`, // list of recipients
        subject: `You have been invited by ${ownerMail} to DO_IT tasks`, // subject line
        // text: "Hello world?", // plain text body
        html: "<h1>Follow the link to create or signin to your account</h1>", // HTML body
      });

      // console.log("Message sent: %s", info.messageId);
    } catch (err) {
      console.error("Error while sending mail:", err);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getListShares = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  const access = await getAccessLevel(id, userId);
  if (access !== "owner")
    return res.status(404).json({ error: "Board not found." });

  try {
    const list = await pool.query(
      "SELECT id FROM todo_list WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (list.rows.length === 0) {
      return res.status(404).json({ error: "List not found." });
    }

    const result = await pool.query(
      "SELECT id, invited_email, role, status FROM todo_list_shares WHERE list_id = $1",
      [id],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.removeShare = async (req, res, next) => {
  const userId = req.userId;
  const { id, shareId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  const access = await getAccessLevel(id, userId);
  if (access !== "owner") {
    return res
      .status(403)
      .json({ error: "Only the owner can remove this share." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM todo_list_shares WHERE id = $1 AND list_id = $2 RETURNING *",
      [shareId, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Share not found." });
    }

    res.status(200).json({ message: "List removed." });
  } catch (error) {
    next(error);
  }
};
