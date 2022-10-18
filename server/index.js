const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

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

app.post('/api/login', (req, res) => {
    const inputId = req.body.inputID;
    const inputPw = req.body.inputPW;
    
    const sqlInsert = `SELECT login_id,password,Name,grade,date,rate from student WHERE login_id= '${inputId}' AND password = '${inputPw}'`;

    database.query(sqlInsert, (err, result) => {
        if (err) {
            console.log(`${err}는 이거`);
        } else if (result) {
            if(result[0] == null){
                console.log("아니다");
                let mes = 'no';
                res.send(mes);
            } else{
                console.log(result[0])
                const jwtSecretKey = process.env.JWT_SECRET_KEY;
                var token = jwt.sign(result[0].toObject(), jwtSecretKey);
            }
        }
    })
});
app.get("/api/user/veri", (req, res) => {
    // Tokens are generally passed in the header of the request
    // Due to security reasons.
  
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
  
    try {
        const token = req.header(tokenHeaderKey);
  
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            return res.send("Successfully Verified");
        }else{
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});