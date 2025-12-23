//all links
/*
Authentication Routes
🔑 Login Page:
http://localhost:3000/login

📝 Register Page:
http://localhost:3000/register

🚪 Logout (if you're handling it via GET):
http://localhost:3000/logout

📚 Books Management
📖 View All Books:
http://localhost:3000/viewBooks

➕ Add New Book (for admin):
http://localhost:3000/addBook

🔍 Search Books (with query param):
http://localhost:3000/searchBooks?query=success

👤 User Actions
For any specific book ID (replace 1 with actual book ID):

✏️ Edit Book:
http://localhost:3000/editBook/1

❌ Delete Book:
http://localhost:3000/deleteBook/1

📥 Issue Book:
http://localhost:3000/issueBook/1

📦 Issued Books (Student View / Admin View)
📑 View Issued Books:
http://localhost:3000/issuedBooks


*/






//all links
/*
Authentication Routes
🔑 Login Page:
http://localhost:3000/login

📝 Register Page:
http://localhost:3000/register

🚪 Logout (if you're handling it via GET):
http://localhost:3000/logout

📚 Books Management
📖 View All Books:
http://localhost:3000/viewBooks

➕ Add New Book (for admin):
http://localhost:3000/addBook

🔍 Search Books (with query param):
http://localhost:3000/searchBooks?query=success

👤 User Actions
For any specific book ID (replace 1 with actual book ID):

✏️ Edit Book:
http://localhost:3000/editBook/1

❌ Delete Book:
http://localhost:3000/deleteBook/1

📥 Issue Book:
http://localhost:3000/issueBook/1

📦 Issued Books (Student View / Admin View)
📑 View Issued Books:
http://localhost:3000/issuedBooks


*/






const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db');

// Initialize the express app
const app = express();



const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);


// Middleware setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'library-secret',
    resave: false,
    saveUninitialized: true
}));

// Import Routes
const authRoutes = require('./routes/auth');

// Use the imported routes
app.use('/', authRoutes);
const bookRoutes = require('./routes/bookRoutes'); // adjust path as needed
app.use('/', bookRoutes);


// Admin dashboard
// Admin Dashboard Route
app.get('/admin/dashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.render('adminDashboard'); // Ensure this EJS file exists
    } else {
        res.redirect('/login');
    }
});

// Student Dashboard Route
app.get('/student/dashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'student') {
        res.render('studentDashboard'); // Ensure this EJS file exists
    } else {
        res.redirect('/login');
    }
});



// Start the server
app.listen(3000, () => {
    console.log('🚀 Server is running at http://localhost:3000');


});