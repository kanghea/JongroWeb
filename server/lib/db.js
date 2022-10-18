const mysql = require('mysql');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12341234',
    database: 'cruddatabase'
});

db.getConnection();

module.exports = db;