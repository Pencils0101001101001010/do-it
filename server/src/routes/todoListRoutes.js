const router = require("express").Router();
const requireAuth = require("../middleware/auth.js");
const list = require("../controllers/todoListController.js");
const share = require("../controllers/shareTodoListController.js");

router.use(requireAuth);

//Lists
router.get("/todos", list.getLists);
router.post("/new", list.createList);
router.patch("/edit/:id", list.updateListName);
router.delete("/delete/:id", list.deleteList);

//Shared list
router.post("/:id/share", share.shareList);
router.get("/:id/collaborators", share.getListShares);
router.delete("/:id/collaborators/:shareId", share.removeShare); //:id = todo_list id, :shareId = share_list id

module.exports = router;
