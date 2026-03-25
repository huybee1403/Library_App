const Borrow = require("../models/borrowModel");

const parsePositiveNumber = (value, defaultValue) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return defaultValue;
    return Math.floor(parsed);
};

const borrowController = {
    borrowBook: async (req, res) => {
        try {
            const userId = req.user.id;
            const bookId = Number(req.body.book_id);
            const borrowDays = parsePositiveNumber(req.body.borrow_days, 14);

            if (!bookId) {
                return res.status(400).json({ success: false, message: "book_id la bat buoc" });
            }

            const result = await Borrow.borrowBook({ userId, bookId, borrowDays });
            return res.status(201).json({
                success: true,
                message: "Muon sach thanh cong",
                data: result,
            });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    },

    returnBook: async (req, res) => {
        try {
            const userId = req.user.id;
            const isAdmin = req.user.role === "admin";
            const borrowId = Number(req.params.borrowId);

            if (!borrowId) {
                return res.status(400).json({ success: false, message: "borrowId khong hop le" });
            }

            const result = await Borrow.returnBook({ borrowId, userId, isAdmin });
            return res.status(200).json({
                success: true,
                message: "Tra sach thanh cong",
                data: result,
            });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    },

    extendBorrow: async (req, res) => {
        try {
            const userId = req.user.id;
            const isAdmin = req.user.role === "admin";
            const borrowId = Number(req.params.borrowId);
            const extraDays = parsePositiveNumber(req.body.extra_days, 7);

            if (!borrowId) {
                return res.status(400).json({ success: false, message: "borrowId khong hop le" });
            }

            const result = await Borrow.extendBorrow({ borrowId, userId, extraDays, isAdmin });
            return res.status(200).json({
                success: true,
                message: "Gia han thanh cong",
                data: result,
            });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    },

    reserveBook: async (req, res) => {
        try {
            const userId = req.user.id;
            const bookId = Number(req.body.book_id);

            if (!bookId) {
                return res.status(400).json({ success: false, message: "book_id la bat buoc" });
            }

            const result = await Borrow.reserveBook({ userId, bookId });
            return res.status(201).json({
                success: true,
                message: "Dat truoc thanh cong",
                data: result,
            });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    },

    getBorrowHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const isAdmin = req.user.role === "admin";
            const targetUserId = req.query.user_id ? Number(req.query.user_id) : null;

            const history = await Borrow.getBorrowHistory({ userId, isAdmin, targetUserId });
            return res.status(200).json({ success: true, data: history });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    },

    getBookStatus: async (req, res) => {
        try {
            const bookId = Number(req.params.bookId);

            if (!bookId) {
                return res.status(400).json({ success: false, message: "bookId khong hop le" });
            }

            const status = await Borrow.getBookStatus(bookId);
            return res.status(200).json({ success: true, data: status });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    },

    checkOverdue: async (req, res) => {
        try {
            const userId = req.user.id;
            const isAdmin = req.user.role === "admin";

            const overdueRows = await Borrow.getOverdueBorrows({ userId, isAdmin });
            return res.status(200).json({
                success: true,
                total: overdueRows.length,
                data: overdueRows,
            });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    },
};

module.exports = borrowController;
