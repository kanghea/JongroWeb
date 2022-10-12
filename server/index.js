const express = require('express');
const mysql = require('mysql');
const app = express();
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12341234',
    database: 'cruddatabase'
});
const PORT = 3001;
app.get('/', (req, res) =>{
    const sqlInsert = 
    "INSERT INTO movie_review (movie_name, movie_revie) VALUES ('asdf', 'asdfasdf');";
    db.query(sqlInsert, (err, result)=>{
        res.send("Hello World!")
    });
});
 
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});