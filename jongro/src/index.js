import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './desktop/main';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router, Route, Routes,Link, BrowserRouter} from 'react-router-dom';

import Student from './desktop/student';
import Teacher from './desktop/Teacher';
import TeacherMypage from './desktop/teacherCom/TeacherMypage';
import Parents from './desktop/Parents';
import MainM from './mobile/student/LoginM';
import R_Login from './desktop/studentCom/R_Login';

import StudentMypage from './desktop/studentCom/StudentMypage';
import Loading from './desktop/components/loading';
import Err from './desktop/Err';
import TeacherLoginacc from './desktop/teacherCom/TeacherLoginacc';
import TeacherStudent from './desktop/teacherCom/TeacherStudent';
import LoginM from './mobile/student/LoginM';
import Mainpage from './mobile/student/Mainpage';
import Login from './mobile/student/Login';
import Stuhomework from './mobile/student/Stuhomework';
import Mypage from './mobile/student/Mypage';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Loading/>} />
        <Route path="/main" element={<Main />} />
        <Route path="/student" element={<Student/>} />
        <Route path="/student/Mypage" element={<StudentMypage/>} />
        
        <Route path="/stu" element={<R_Login/>} />
        <Route path="/teacher" element={<Teacher/>} />
        <Route path="/teacher/Mypage" element={<TeacherMypage/>} />
        
        <Route path="/parents" element={<Parents/>} />
        <Route path="/teacher/acc" element={<TeacherLoginacc/>} />
        <Route path="/teacher/student" element={<TeacherStudent/>} />
        <Route path="/student/Mypage" element={<MainM/>} />
        <Route path="*" element={<Err/>} />

        <Route path="/m" element={<Login/>} />
        <Route path="/m/acc" element={<LoginM/>} />
        <Route path="/m/student" element={<Mainpage/>}/>
        <Route path="/m/student/homework" element={<Stuhomework/>}/>
        <Route path="/m/student/mypage" element={<Mypage/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
