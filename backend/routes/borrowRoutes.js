const express = require("express");
const router = express.Router();

const borrowController = require("../controllers/borrowController");
const authMiddleware = require("../middlewares/auth/authMiddleware");

router.use(authMiddleware);

router.post("/", borrowController.borrowBook);
router.post("/reservations", borrowController.reserveBook);
router.get("/history", borrowController.getBorrowHistory);
router.get("/overdue", borrowController.checkOverdue);
router.get("/books/:bookId/status", borrowController.getBookStatus);
router.post("/:borrowId/return", borrowController.returnBook);
router.post("/:borrowId/extend", borrowController.extendBorrow);

module.exports = router;
