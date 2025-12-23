const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: Login Page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// GET: Register Page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// POST: Register User
router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.render('register', { error: 'Something went wrong. Please try again.' });
        }

        if (results.length > 0) {
            return res.render('register', { error: 'Email already exists!' });
        }

        // If email doesn't exist, insert new user
        db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.render('register', { error: 'Invalid input. Please check your data.' });
                }
                res.redirect('/login');
            });
    });
});


// POST: Login User
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.user = results[0];

            if (results[0].role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/student/dashboard');
            }
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    });
});





// GET: Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
