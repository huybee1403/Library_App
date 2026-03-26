const db = require("../config/db_config");

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const Borrow = {
  // Muon sach: tao phieu muon neu sach chua co ai giu va khong vi pham hang doi dat truoc
  borrowBook: async ({ userId, bookId, borrowDays = 14 }) => {
    return db.transaction(async (connection) => {
      const [bookRows] = await connection.query(
        "SELECT id, title FROM books WHERE id = ?",
        [bookId],
      );
      if (!bookRows.length) {
        throw createError("Khong tim thay sach", 404);
      }

      const [activeBorrowRows] = await connection.query(
        `SELECT id, user_id, due_date
                 FROM borrows
                 WHERE book_id = ? AND return_date IS NULL
                 LIMIT 1
                 FOR UPDATE`,
        [bookId],
      );

      if (activeBorrowRows.length) {
        throw createError("Sach hien dang duoc muon", 400);
      }

      const [firstReservationRows] = await connection.query(
        `SELECT id, user_id
                 FROM reservations
                 WHERE book_id = ?
                 ORDER BY created_at ASC
                 LIMIT 1
                 FOR UPDATE`,
        [bookId],
      );

      if (
        firstReservationRows.length &&
        firstReservationRows[0].user_id !== userId
      ) {
        throw createError("Sach dang duoc dat truoc boi nguoi dung khac", 409);
      }

      const [result] = await connection.query(
        `INSERT INTO borrows (user_id, book_id, borrow_date, due_date, status)
                 VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'borrowed')`,
        [userId, bookId, borrowDays],
      );

      if (
        firstReservationRows.length &&
        firstReservationRows[0].user_id === userId
      ) {
        await connection.query("DELETE FROM reservations WHERE id = ?", [
          firstReservationRows[0].id,
        ]);
      }

      return {
        borrowId: result.insertId,
        bookId,
        dueInDays: borrowDays,
      };
    });
  },

  // Tra sach: dong phieu muon va tra ve thong tin nguoi dat truoc tiep theo (neu co)
  returnBook: async ({ borrowId, userId, isAdmin = false }) => {
    return db.transaction(async (connection) => {
      const [borrowRows] = await connection.query(
        `SELECT b.id, b.user_id, b.book_id, b.due_date, b.return_date, bk.title
                 FROM borrows b
                 JOIN books bk ON bk.id = b.book_id
                 WHERE b.id = ?
                 LIMIT 1
                 FOR UPDATE`,
        [borrowId],
      );

      if (!borrowRows.length) {
        throw createError("Khong tim thay phieu muon", 404);
      }

      const borrow = borrowRows[0];

      if (!isAdmin && borrow.user_id !== userId) {
        throw createError("Ban khong co quyen tra phieu muon nay", 403);
      }

      if (borrow.return_date) {
        throw createError("Sach da duoc tra truoc do", 400);
      }

      await connection.query(
        `UPDATE borrows
                 SET return_date = CURDATE(),
                     status = CASE WHEN due_date < CURDATE() THEN 'late' ELSE 'returned' END
                 WHERE id = ?`,
        [borrowId],
      );

      const [nextReservationRows] = await connection.query(
        `SELECT r.id, r.user_id, u.name, u.email
                 FROM reservations r
                 JOIN users u ON u.id = r.user_id
                 WHERE r.book_id = ?
                 ORDER BY r.created_at ASC
                 LIMIT 1`,
        [borrow.book_id],
      );

      return {
        borrowId,
        bookId: borrow.book_id,
        nextReservation: nextReservationRows[0] || null,
      };
    });
  },

  // Gia han: chi cho phep khi phieu con hieu luc va sach chua co nguoi khac dat truoc
  extendBorrow: async ({
    borrowId,
    userId,
    extraDays = 7,
    isAdmin = false,
  }) => {
    return db.transaction(async (connection) => {
      const [borrowRows] = await connection.query(
        `SELECT id, user_id, book_id, due_date, return_date
                 FROM borrows
                 WHERE id = ?
                 LIMIT 1
                 FOR UPDATE`,
        [borrowId],
      );

      if (!borrowRows.length) {
        throw createError("Khong tim thay phieu muon", 404);
      }

      const borrow = borrowRows[0];

      if (!isAdmin && borrow.user_id !== userId) {
        throw createError("Ban khong co quyen gia han phieu muon nay", 403);
      }

      if (borrow.return_date) {
        throw createError("Khong the gia han vi sach da duoc tra", 400);
      }

      const [overdueRows] = await connection.query(
        "SELECT due_date < CURDATE() AS is_overdue FROM borrows WHERE id = ?",
        [borrowId],
      );
      if (overdueRows[0].is_overdue) {
        throw createError("Khong the gia han cho phieu muon da qua han", 400);
      }

      const [reservationByOthersRows] = await connection.query(
        `SELECT COUNT(*) AS total
                 FROM reservations
                 WHERE book_id = ? AND user_id <> ?`,
        [borrow.book_id, borrow.user_id],
      );

      if (reservationByOthersRows[0].total > 0) {
        throw createError(
          "Khong the gia han vi sach da co nguoi dat truoc",
          409,
        );
      }

      await connection.query(
        "UPDATE borrows SET due_date = DATE_ADD(due_date, INTERVAL ? DAY) WHERE id = ?",
        [extraDays, borrowId],
      );

      const [updatedRows] = await connection.query(
        "SELECT id, due_date FROM borrows WHERE id = ?",
        [borrowId],
      );

      return {
        borrowId,
        dueDate: updatedRows[0].due_date,
        extendedDays: extraDays,
      };
    });
  },

  // Dat truoc: chi dat khi sach dang duoc muon, tranh dat truoc trung lap
  reserveBook: async ({ userId, bookId }) => {
    return db.transaction(async (connection) => {
      const [bookRows] = await connection.query(
        "SELECT id, title FROM books WHERE id = ?",
        [bookId],
      );
      if (!bookRows.length) {
        throw createError("Khong tim thay sach", 404);
      }

      const [activeBorrowRows] = await connection.query(
        `SELECT id
                 FROM borrows
                 WHERE book_id = ? AND return_date IS NULL
                 LIMIT 1
                 FOR UPDATE`,
        [bookId],
      );

      if (!activeBorrowRows.length) {
        throw createError("Sach dang san sang, ban co the muon truc tiep", 400);
      }

      const [activeBorrowByUserRows] = await connection.query(
        `SELECT id
                 FROM borrows
                 WHERE user_id = ? AND book_id = ? AND return_date IS NULL
                 LIMIT 1`,
        [userId, bookId],
      );

      if (activeBorrowByUserRows.length) {
        throw createError("Ban dang muon sach nay", 400);
      }

      const [existingReservationRows] = await connection.query(
        `SELECT id
                 FROM reservations
                 WHERE user_id = ? AND book_id = ?
                 LIMIT 1`,
        [userId, bookId],
      );

      if (existingReservationRows.length) {
        throw createError("Ban da dat truoc sach nay", 400);
      }

      const [result] = await connection.query(
        "INSERT INTO reservations (user_id, book_id) VALUES (?, ?)",
        [userId, bookId],
      );

      const [positionRows] = await connection.query(
        `SELECT COUNT(*) AS position
                 FROM reservations
                 WHERE book_id = ? AND id <= ?`,
        [bookId, result.insertId],
      );

      return {
        reservationId: result.insertId,
        bookId,
        queuePosition: positionRows[0].position,
      };
    });
  },

  // Lich su muon: user xem cua minh, admin xem tat ca hoac loc theo user
  getBorrowHistory: async ({
    userId,
    isAdmin = false,
    targetUserId = null,
  }) => {
    let whereSql = "WHERE 1=1";
    const params = [];

    if (!isAdmin) {
      whereSql += " AND b.user_id = ?";
      params.push(userId);
    } else if (targetUserId) {
      whereSql += " AND b.user_id = ?";
      params.push(targetUserId);
    }

    const rows = await db.query(
      `SELECT b.id, b.user_id, u.name AS user_name, u.email,
                    b.book_id, bk.title AS book_title,
                    b.borrow_date, b.due_date, b.return_date, b.status,
                    b.created_at
             FROM borrows b
             JOIN users u ON u.id = b.user_id
             JOIN books bk ON bk.id = b.book_id
             ${whereSql}
             ORDER BY b.created_at DESC`,
      params,
    );

    return rows;
  },

  // Trang thai sach: available | borrowed | overdue | reserved
  getBookStatus: async (bookId) => {
    const bookRows = await db.query(
      "SELECT id, title FROM books WHERE id = ?",
      [bookId],
    );
    if (!bookRows.length) {
      throw createError("Khong tim thay sach", 404);
    }

    const activeBorrowRows = await db.query(
      `SELECT b.id, b.user_id, b.borrow_date, b.due_date, u.name AS borrower_name,
                    (b.due_date < CURDATE()) AS is_overdue
             FROM borrows b
             JOIN users u ON u.id = b.user_id
             WHERE b.book_id = ? AND b.return_date IS NULL
             LIMIT 1`,
      [bookId],
    );

    const reservationCountRows = await db.query(
      "SELECT COUNT(*) AS total FROM reservations WHERE book_id = ?",
      [bookId],
    );

    const nextReservationRows = await db.query(
      `SELECT r.id, r.user_id, u.name, u.email, r.created_at
             FROM reservations r
             JOIN users u ON u.id = r.user_id
             WHERE r.book_id = ?
             ORDER BY r.created_at ASC
             LIMIT 1`,
      [bookId],
    );

    const activeBorrow = activeBorrowRows[0] || null;
    const reservationCount = reservationCountRows[0].total;

    let status = "available";
    if (activeBorrow) {
      status = activeBorrow.is_overdue ? "overdue" : "borrowed";
    } else if (reservationCount > 0) {
      status = "reserved";
    }

    return {
      book: bookRows[0],
      status,
      activeBorrow,
      reservationCount,
      nextReservation: nextReservationRows[0] || null,
    };
  },

  // Qua han: dong bo status late va lay danh sach phieu qua han
  getOverdueBorrows: async ({ userId, isAdmin = false }) => {
    await db.query(
      `UPDATE borrows
             SET status = 'late'
             WHERE return_date IS NULL
               AND due_date < CURDATE()
               AND status = 'borrowed'`,
    );

    let whereSql = "WHERE b.return_date IS NULL AND b.due_date < CURDATE()";
    const params = [];

    if (!isAdmin) {
      whereSql += " AND b.user_id = ?";
      params.push(userId);
    }

    const rows = await db.query(
      `SELECT b.id, b.user_id, u.name AS user_name, u.email,
                    b.book_id, bk.title AS book_title,
                    b.borrow_date, b.due_date,
                    DATEDIFF(CURDATE(), b.due_date) AS overdue_days,
                    b.status
             FROM borrows b
             JOIN users u ON u.id = b.user_id
             JOIN books bk ON bk.id = b.book_id
             ${whereSql}
             ORDER BY b.due_date ASC`,
      params,
    );

    return rows;
  },
};

module.exports = Borrow;
