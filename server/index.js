const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const crypto = require("crypto");

dotenv.config();
const app = express();
const database = mysql.createPool({
    host: '127.0.0.1',
    user: 'admin',
    password: process.env.password,
    database: 'jongrosky',
    port: '3306'
});

app.use(express.json());
const PORT = process.env.PORT || 3001;
app.use(bodyParser.urlencoded({ extended: true }));


const cors = require('cors');
const { response } = require('express');


const corsOptions = {
    origin: "http://162.248.101.98",
    credentials: true
};
app.use(cors(corsOptions));

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
            if (result[0] == null) {
                console.log("아니다");
                res.send(200, "error");
            } else {
                ID = result[0].ID
                login_id = result[0].login_id
                password = result[0].password
                Name = result[0].Name
                Class = result[0].class
                var pass = crypto.createHash('sha512').update(`${password}`).digest('base64');

                let data = {
                    password: pass
                }
                const jwtSecretKey = process.env.STUJWT_SECRET_KEY;

                var token = jwt.sign(data, jwtSecretKey, { expiresIn: '5days' });

                res.send(token)
                console.log(pass)
                console.log(token)
                console.log(`<br/>`)

            }
        }
    })
});

app.post('/api/login/student/Class', (req, res) => {
    const inputId = req.body.inputID;
    var inputPw = req.body.inputPW;
    var inputPw = crypto.createHash('sha512').update(`${inputPw}`).digest('base64');
    console.log(inputPw)
    const sqlInsert = `SELECT ID,login_id,password,Name,classs from student WHERE login_id= '${inputId}' AND password = '${inputPw}'`;

    database.query(sqlInsert, (err, result) => {
        if (err) {
            console.log(`${err}는 이거`);
        } else if (result) {
            if (result[0] == null) {
                console.log("아니다");
                res.send(200, "err");
            } else {
                ID = result[0].ID
                login_id = result[0].login_id
                password = result[0].password
                Name = result[0].Name
                Classs = result[0].classs
                console.log(Classs)
                res.send(Classs)

            }
        }
    })
});

app.post('/api/login/student/comment', (req, res) => {
    const inputId = req.body.inputID;

    const sqlInsert = `SELECT ID,login_id,password,Name,classs,comment from student WHERE login_id= '${inputId}'`;

    database.query(sqlInsert, (err, result) => {
        if (err) {
            console.log(`${err}는 이거`);
        } else if (result) {
            if (result[0] == null) {
                console.log("아니다");
                res.send(200, "err");
            } else {
                ID = result[0].ID
                login_id = result[0].login_id
                password = result[0].password
                Name = result[0].Name
                Classs = result[0].classs
                comment = result[0].comment
                if(comment == null){
                    res.status(200).send("error")
                } else{
                    res.status(200).send(comment)
                }
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
            if (result[0] == null) {
                console.log("no");
                res.send(200, "error");
            } else {
                ID = result[0].ID
                login_id = result[0].login_id
                password = result[0].password
                Name = result[0].Name

                var pass = crypto.createHash('sha512').update(`${password}`).digest('base64');

                let data = {
                    password: pass
                }
                const jwtSecretKey = process.env.TEAJWT_SECRET_KEY;

                var token = jwt.sign(data, jwtSecretKey, { expiresIn: '5days' });

                res.send(200, token)
                console.log(token)

            }
        }
    })
});
app.post('/api/teacher/student', (req, res) => {
    const Name = req.body.Name;
    const Grade = req.body.Grade;
    const Teacher = req.body.Teacher;
    const Birthday = req.body.Birthday;
    const Class = req.body.Class;


    var inputPw = crypto.createHash('sha512').update(`${Birthday}`).digest('base64');
    const sqlInsert = `INSERT INTO jongrosky.student (Name, grade, login_id, password, teacher,class) VALUES ('${Name}', '${Grade}', '${Name}', '${inputPw}', '${Teacher}','${Class}')`;
    const sqlin = `INSERT INTO jongrosky.homework (name) VALUES ('${Name}');`

    database.query(sqlInsert, (err, result) => {
        if (err) {
            console.log(err)
            res.send("err");
        } else if (result) {
            res.send("success");
        }
    })
    database.query(sqlin, (err, result) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.log(result);
        }
    })
});

app.post('/api/comment/student', (req, res) => {
    const Name = req.body.login_id;
    const comment = req.body.comment;

    const sql = `UPDATE jongrosky.student SET comment = '${comment}' WHERE (Name = '${Name}');`
    database.query(sql, (err, result) => {
        if (err) {
            console.log(err)
            res.send("err");
        } else if (result) {
            res.send("success");
        }
    })
});

app.post("/api/student/acc", (req, res) => {

    let jwtSecretKey = process.env.STUJWT_SECRET_KEY;
    const inputId = req.body.inputID;
    var token = req.body.token;
    console.log(token)
    console.log(inputId)
    try {

        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return res.send("success");
        } else {
            // Access Denied
            return res.send("error");
        }
    } catch (error) {
        // Access Denied
        return res.send("error");
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
        if (verified) {
            return res.send("Success");
        } else {
            // Access Denied
            return res.send("error");
        }
    } catch (error) {
        // Access Denied
        return res.send("error");
    }
});

app.post("/api/admin/acc", (req, res) => {
    // Tokens are generally passed in the header of the request
    // Due to security reasons. 
    let jwtSecretKey = process.env.ADMJWT_SECRET_KEY;
    const inputId = req.body.inputID;
    var token = req.body.token;
    console.log(token)
    console.log(inputId)
    try {

        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return res.send("success");
        } else {
            // Access Denied
            return res.send("error");
        }
    } catch (error) {
        // Access Denied
        return res.send("error");
    }
});

app.post('/api/student/homework', (req, res) => {
    const wh = req.body.wh;
    var what = req.body.what;
    var login_id = req.body.login_id;

    const date = new Date();

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const did = `${month}/${day}`

    if (wh == 1) {
        console.log(did)
        var sqlin2 = `UPDATE jongrosky.homework SET \`${did}\` = '완료' WHERE (name = '${login_id}');`;
        database.query(sqlin2, (err, result) => {
            if (err) {
                console.log(err)
                console.log("에러에오!")
            } else {
                console.log(result)
                console.log("잘입력됐어요!")
                res.send("success")
            }
        })
    } else {
        var sqlin2 = `UPDATE jongrosky.homework SET \`${did}\` = '${what}' WHERE (name = '${login_id}');`
        database.query(sqlin2, (result) => {
            if (result == null) {
                var sqlin2 = `UPDATE jongrosky.homework SET \`${did}\` = '${what}' WHERE (name = '${login_id}');`
                database.query(sqlin2, (result) => {
                    console.log(result);
                    res.send("success")
                })
                console.log("2")
            } else {
                console.log(result)
                console.log("잘입력됐어요!")
                res.send("success")
            }
        })
        console.log("잘 입력 됐어요!")
    }
});

app.post('/api/login/admin', (req, res) => {

    const inputId = req.body.inputID;
    var inputPw = req.body.inputPW;
    var inputPw = crypto.createHash('sha512').update(`${inputPw}`).digest('base64');
    console.log(inputPw)
    const sqlInsert = `SELECT ID,login_id,password,Name from Admin WHERE login_id= '${inputId}' AND password = '${inputPw}'`;

    database.query(sqlInsert, (err, result) => {
        if (err) {
            console.log(`${err}는 이거`);
        } else if (result) {
            if (result[0] == null) {
                console.log("no");
                res.send(200, "error");
            } else {
                ID = result[0].ID
                login_id = result[0].login_id
                password = result[0].password
                Name = result[0].Name

                var pass = crypto.createHash('sha512').update(`${password}`).digest('base64');

                let data = {
                    password: pass
                }

                const jwtSecretKey = process.env.ADMJWT_SECRET_KEY;

                var token = jwt.sign(data, jwtSecretKey, { expiresIn: '5days' });

                res.send(200, token)
                console.log(token)
            }
        }
    })
});

app.post('/api/student/homework/acc', (req, res) => {
    var login_id = req.body.login_id;

    const date = new Date();

    const month = date.getMonth() + 1;
    const day = date.getDate();

    const did = `${month}/${day}`

    var sqlin2 = `SELECT * FROM (homework) WHERE (name = '${login_id}') and (\`${did}\` is not null);`
    database.query(sqlin2, (err, result) => {
        console.log(result[0])
        if (result[0] == null) {
            res.send("no")
        } else {
            res.send("success")
        }
    })
});

app.post('/api/admin/homework', (req, res) => {
    const date = new Date();

    const month = date.getMonth() + 1;
    const day = date.getDate();

    const did = `${month}/${day}`
    var sqlin3 = `SELECT Name,\`${did}\` FROM homework Where \`12/16\` is null`
    var sqlin4 = `SELECT Name,\`${did}\` FROM homework Where \`12/16\` = "완료"`
    
    database.query(sqlin3, (err, result) => {
        
        var obj = JSON.stringify(result)

        res.status(200).send(obj);
    })
});

const { type } = require('os');
const { stringify } = require('querystring');

app.listen(PORT, () => {
    const schedule = require('node-schedule');
    const rule = new schedule.RecurrenceRule()

    rule.dayOfWeek = [0, new schedule.Range(2, 4)]
    rule.hour = 9
    rule.minute = 0
    rule.tz = 'Asia/Seoul'

    const offset = 1000 * 60 * 60 * 9
    const koreaNow = new Date((new Date()).getTime() + offset)
    console.log(koreaNow)

    const date = new Date();

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const did = `${month}/${day}`

    const sql = `ALTER TABLE jongrosky.homework ADD COLUMN \`${did}\` TEXT NULL`
    const sql2 = `ALTER TABLE jongrosky.cheak ADD COLUMN \`${did}\` TEXT NULL`

    const dat = '0 0 0 * 1-6';

    schedule.scheduleJob(rule, function () {
        database.query(sql, (err, result) => {
            if (err) { console.log(err) }
            else {
                console.log(result)
                res.send(result)
                console.log("성공적으로 입력!")
            }
        })
    });
    console.log(`Server is running on port: ${PORT}`);
});