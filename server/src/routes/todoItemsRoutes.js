const router = require("express").Router();
const requireAuth = require("../middleware/auth.js");
const items = require("../controllers/todoItemsControllers.js");

router.use(requireAuth);

router.patch("/:id/item/:itemId", items.updateItem);
router.delete("/remove-item/:id", items.deleteItem);

module.exports = router;
