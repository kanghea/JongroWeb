const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12341234',
    database: 'cruddatabase'
});
app.use(express.json());
const PORT = 3001;
app.use(bodyParser.urlencoded({extended:true}));


const cors = require('cors');

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
}
app.use(cors(corsOptions));
app.post('/api/insert',(req,res)=>{
    console.log('??')
    const movieName = req.body.movieName;
    const movieReview = req.body.movieReview;
    console.log(`이건${movieName}`)
    const sqlInsert = `INSERT INTO movie_review (movie_name, movie_revie) VALUES ('${movieName}', '${movieReview}');`;
    db.query(sqlInsert,(err,result)=>{console.log(result);});
});

app.post('/api/login',(req,res)=>{
    const inputId = req.body.inputID;
    const inputPw = req.body.inputPW;
    const sqlInsert = `INSERT INTO users (name,password) VALUES ('${inputId}', '${inputPw}');`;
    db.query(sqlInsert,(err,result)=>{console.log(result);});
});
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});