const router = require("express").Router();
const requireAuth = require("../middleware/auth.js");
const list = require("../controllers/todoListController.js");
const share = require("../controllers/shareTodoListController.js");
const items = require("../controllers/todoItemsControllers.js");

router.use(requireAuth);

//Lists
router.get("/todos", list.getLists);
router.post("/new", list.createList);
router.patch("/edit/:id", list.updateListName);
router.delete("/delete/:id", list.deleteList);

//Shared list
router.get("/:id/collaborators", share.getListShares);
router.post("/:id/share", share.shareList);
router.delete("/:id/collaborators/:shareId", share.removeShare); //:id = todo_list id, :shareId = share_list id

//items
router.get("/items", items.getItems); //:id list id
router.post("/:id/new", items.createItems); //:id list id

module.exports = router;
