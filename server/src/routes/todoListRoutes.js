const router = require("express").Router();
const requireAuth = require("../middleware/auth.js");
const list = require("../controllers/todoListController.js");

router.get("/todos", requireAuth, list.getLists);
router.post("/new", requireAuth, list.createList);
router.patch("/edit/:id", requireAuth, list.updateListName);

module.exports = router;
