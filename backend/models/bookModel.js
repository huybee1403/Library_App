const db = require("../config/db_config");

const Book = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT b.*, a.name as author_name, c.name as category_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id
            ORDER BY b.created_at DESC
        `);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT b.*, a.name as author_name, c.name as category_name 
            FROM books b 
            LEFT JOIN authors a ON b.author_id = a.id 
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = ?
        `, [id]);
        return rows[0];
    },

    create: async (bookData) => {
        const { title, author_id, category_id, description, cover_image, pdf_file, published_year } = bookData;
        const [result] = await db.query(`
            INSERT INTO books (title, author_id, category_id, description, cover_image, pdf_file, published_year) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [title, author_id, category_id, description, cover_image, pdf_file, published_year]);
        return result.insertId;
    },

    update: async (id, bookData) => {
        const { title, author_id, category_id, description, cover_image, pdf_file, published_year } = bookData;
        await db.query(`
            UPDATE books 
            SET title = ?, author_id = ?, category_id = ?, description = ?, 
                cover_image = ?, pdf_file = ?, published_year = ? 
            WHERE id = ?
        `, [title, author_id, category_id, description, cover_image, pdf_file, published_year, id]);
    },

    delete: async (id) => {
        await db.query("DELETE FROM books WHERE id = ?", [id]);
    }
};

module.exports = Book;
