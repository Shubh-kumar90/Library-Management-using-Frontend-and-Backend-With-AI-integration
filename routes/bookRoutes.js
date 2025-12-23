const express = require('express');
const router = express.Router();
const db = require('../db');

// ------------------------------
// View all books
// ------------------------------
router.get('/viewBooks', (req, res) => {
    const userRole = req.session.user?.role;

    db.query('SELECT * FROM books', (err, results) => {
        if (err) return res.send('DB error');
        res.render('viewBooks', { books: results, role: userRole });
    });
});

// ------------------------------
// Add Book (admin only)
// ------------------------------




router.get('/addBook', (req, res) => {
    if (req.session.user?.role === 'admin') {
        res.render('addBook');
    } else {
        res.send('Access Denied');
    }
});

router.post('/addBook', (req, res) => {
    if (req.session.user?.role !== 'admin') return res.send('Access Denied');

    const { title, author, category, quantity } = req.body;
    const sql = 'INSERT INTO books (title, author, category, quantity) VALUES (?, ?, ?, ?)';

    db.query(sql, [title, author, category, quantity], (err) => {
        if (err) {
            console.error(err);
            return res.render('addBook', { error: 'Failed to add book!' });
        }
        res.redirect('/viewBooks');
    });
});

// ------------------------------
// Search Books
// ------------------------------
router.get('/searchBooks', (req, res) => {
    const { query } = req.query;
    const search = `%${query}%`;
    const userRole = req.session.user?.role;

    const sql = `
        SELECT * FROM books 
        WHERE title LIKE ? OR author LIKE ? OR category LIKE ?
    `;

    db.query(sql, [search, search, search], (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Error searching books.');
        }
        res.render('viewBooks', { books: results, role: userRole });
    });
});

// ------------------------------
// Delete Book (admin or librarian only)
// ------------------------------
router.get('/deleteBook/:id', (req, res) => {
    const role = req.session.user?.role;
    if (role !== 'admin' && role !== 'librarian') {
        return res.send('Access Denied');
    }

    const bookId = req.params.id;

    db.query('DELETE FROM issued_books WHERE book_id = ?', [bookId], (err) => {
        if (err) {
            console.error(err);
            return res.send('Failed to delete related issued book entries.');
        }

        db.query('DELETE FROM books WHERE id = ?', [bookId], (err) => {
            if (err) {
                console.error(err);
                return res.send('Failed to delete book.');
            }
            res.redirect('/viewBooks');
        });
    });
});

// ------------------------------
// Edit Book (admin or librarian only)
// ------------------------------
router.get('/editBook/:id', (req, res) => {
    const role = req.session.user?.role;
    if (role !== 'admin' && role !== 'librarian') {
        return res.send('Access Denied');
    }

    const bookId = req.params.id;
    db.query('SELECT * FROM books WHERE id = ?', [bookId], (err, results) => {
        if (err || results.length === 0) {
            return res.send('Book not found');
        }
        res.render('editBook', { book: results[0] });
    });
});

router.post('/editBook/:id', (req, res) => {
    const role = req.session.user?.role;
    if (role !== 'admin' && role !== 'librarian') {
        return res.send('Access Denied');
    }

    const bookId = req.params.id;
    const { title, author, category, quantity } = req.body;

    const sql = 'UPDATE books SET title = ?, author = ?, category = ?, quantity = ? WHERE id = ?';
    db.query(sql, [title, author, category, quantity, bookId], (err) => {
        if (err) {
            console.error(err);
            return res.send('Failed to update book.');
        }
        res.redirect('/viewBooks');
    });
});

// ------------------------------
// Issue Book (all logged-in users)
// ------------------------------
router.get('/issueBook/:id', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const bookId = req.params.id;
    const userId = req.session.user.id;

    db.query('SELECT * FROM books WHERE id = ?', [bookId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching book details.');
        }

        const book = results[0];
        if (!book || book.quantity <= 0) {
            return res.send('Book is not available for issuing!');
        }

        const issueDate = new Date();
        const returnDate = new Date(issueDate);
        returnDate.setDate(issueDate.getDate() + 14);

        db.query(
            'INSERT INTO issued_books (user_id, book_id, issue_date, return_date, status) VALUES (?, ?, ?, ?, ?)',
            [userId, bookId, issueDate, returnDate, 'issued'],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Failed to issue the book!');
                }

                db.query('UPDATE books SET quantity = quantity - 1 WHERE id = ?', [bookId], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Failed to update book quantity!');
                    }

                    res.send('Book issued successfully!');
                });
            }
        );
    });
});

module.exports = router;
