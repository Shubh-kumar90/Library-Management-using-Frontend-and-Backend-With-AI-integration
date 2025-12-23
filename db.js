const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#Shubh@9984', // change if needed
    database: 'library_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('✅ Connected to MySQL');
});

module.exports = connection;
