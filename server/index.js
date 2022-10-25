const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const crypto = require("crypto");

dotenv.config();
const app = express();
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.password,
    database: 'cruddatabase'
});
const database = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.password,
    database: 'jongro'
});

app.use(express.json());
const PORT = 3001;
app.use(bodyParser.urlencoded({ extended: true }));


const cors = require('cors');
const { response } = require('express');


const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};
app.use(cors(corsOptions));
app.post('/api/insert', (req, res) => {
    console.log('??')
    const movieName = req.body.movieName;
    const movieReview = req.body.movieReview;
    console.log(`이건${movieName}`)
    const sqlInsert = `INSERT INTO movie_review (movie_name, movie_revie) VALUES ('${movieName}', '${movieReview}'); `;
    db.query(sqlInsert, (err, result) => { console.log(result); });
});

app.post('/api/login/student', (req, res) => {
    const inputId = req.body.inputID;
    var inputPw = req.body.inputPW;
    var inputPw = crypto.createHash('sha512').update(`${inputPw}`).digest('base64');
    console.log(inputPw)
    const sqlInsert = `SELECT ID,login_id,password,Name from student WHERE login_id= '${inputId}' AND password = '${inputPw}'`;

    database.query(sqlInsert, (err, result) => {
        if (err) {
            console.log(`${err}는 이거`);
        } else if (result) {
            if(result[0] == null){
                console.log("아니다");
                res.send(200,"error");
            } else{                
                ID = result[0].ID
                login_id = result[0].login_id
                password = result[0].password
                Name = result[0].Name
                
                var pass = crypto.createHash('sha512').update(`${password}`).digest('base64');
                
                let data = {
                    password:pass
                }
                const jwtSecretKey = process.env.STUJWT_SECRET_KEY;
                
                var token = jwt.sign(data, jwtSecretKey,{expiresIn: '5days'});
                
                res.send(200,token) 
                console.log(pass)
                console.log(token)
                console.log(`<br/>`)
                
            }
        }
    })
});
app.post('/api/login/teacher', (req, res) => {
    const inputId = req.body.inputID;
    var inputPw = req.body.inputPW;
    var inputPw = crypto.createHash('sha512').update(`${inputPw}`).digest('base64');
    console.log(inputPw)
    const sqlInsert = `SELECT ID,login_id,password,Name from teacher WHERE login_id= '${inputId}' AND password = '${inputPw}'`;

    database.query(sqlInsert, (err, result) => {
        if (err) {
            console.log(`${err}는 이거`);
        } else if (result) {
            if(result[0] == null){
                console.log("아니다");
                res.send(200,"error");
            } else{                
                ID = result[0].ID
                login_id = result[0].login_id
                password = result[0].password
                Name = result[0].Name
                
                var pass = crypto.createHash('sha512').update(`${password}`).digest('base64');
                
                let data = {
                    password:pass
                }
                const jwtSecretKey = process.env.TEAJWT_SECRET_KEY;
                
                var token = jwt.sign(data, jwtSecretKey,{expiresIn: '5days'});
                
                res.send(200,token) 
                console.log(pass)
                console.log(token)
                console.log(`<br/>`)
                
            }
        }
    })
});
app.post("/api/student/acc", (req, res) => {
    // Tokens are generally passed in the header of the request
    // Due to security reasons. 
    let jwtSecretKey = process.env.STUJWT_SECRET_KEY;
    const inputId = req.body.inputID;
    var token = req.body.token;
    console.log(token)
    console.log(inputId)
    try {
  
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            return res.send("Success");
        }else{
            // Access Denied
            return res.status(401).send("error");
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send("error");
    }
});
app.post("/api/teacher/acc", (req, res) => {
    // Tokens are generally passed in the header of the request
    // Due to security reasons. 
    let jwtSecretKey = process.env.TEAJWT_SECRET_KEY;
    const inputId = req.body.inputID;
    var token = req.body.token;
    console.log(token)
    console.log(inputId)
    try {
  
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            return res.send("Success");
        }else{
            // Access Denied
            return res.send("error");
        }
    } catch (error) {
        // Access Denied
        return res.send("error");
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});