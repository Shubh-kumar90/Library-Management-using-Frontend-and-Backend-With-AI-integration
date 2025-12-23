// 📁 routes/issueRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Make sure you have this file to handle DB connection

// ✅ Issue Book
router.post('/issueBook', (req, res) => {
    const { user_id, book_id } = req.body;
    const issueDate = new Date();
    const sqlCheck = 'SELECT quantity FROM books WHERE book_id = ?';

    db.query(sqlCheck, [book_id], (err, results) => {
        if (err || results.length === 0) return res.status(500).send('Book not found.');
        if (results[0].quantity <= 0) return res.send('Book is not available.');

        // Begin issuing
        const sqlInsert = 'INSERT INTO issued_books (user_id, book_id, issue_date, status) VALUES (?, ?, ?, ?)';
        db.query(sqlInsert, [user_id, book_id, issueDate, 'Issued'], (err2) => {
            if (err2) return res.status(500).send('Error issuing book.');

            const sqlUpdate = 'UPDATE books SET quantity = quantity - 1 WHERE book_id = ?';
            db.query(sqlUpdate, [book_id], (err3) => {
                if (err3) return res.status(500).send('Error updating quantity.');
                res.redirect('/viewIssued');
            });
        });
    });
});

// ✅ Return Book
router.post('/returnBook/:issue_id', (req, res) => {
    const issueId = req.params.issue_id;
    const returnDate = new Date();

    const sqlGetBook = 'SELECT book_id FROM issued_books WHERE issue_id = ?';
    db.query(sqlGetBook, [issueId], (err, results) => {
        if (err || results.length === 0) return res.status(500).send('Issued book not found.');
        const bookId = results[0].book_id;

        const sqlUpdateIssue = 'UPDATE issued_books SET return_date = ?, status = ? WHERE issue_id = ?';
        db.query(sqlUpdateIssue, [returnDate, 'Returned', issueId], (err2) => {
            if (err2) return res.status(500).send('Error returning book.');

            const sqlUpdateBook = 'UPDATE books SET quantity = quantity + 1 WHERE book_id = ?';
            db.query(sqlUpdateBook, [bookId], (err3) => {
                if (err3) return res.status(500).send('Error updating quantity.');
                res.redirect('/viewIssued');
            });
        });
    });
});

// ✅ View All Issued Books
router.get('/viewIssued', (req, res) => {
    const sql = `SELECT ib.*, u.name as student_name, b.title as book_title 
                 FROM issued_books ib
                 JOIN users u ON ib.user_id = u.user_id
                 JOIN books b ON ib.book_id = b.book_id
                 ORDER BY issue_date DESC`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send('Error fetching issued books.');
        res.render('viewIssued', { issuedBooks: results });
    });
});

module.exports = router;
