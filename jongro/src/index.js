import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './desktop/main';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router, Route, Routes,Link} from 'react-router-dom';
import { BrowserView, MobileView } from 'react-device-detect';

import Student from './desktop/student';
import Teacher from './desktop/Teacher';
import Parents from './desktop/Parents';
import MainM from './mobile/mainm';
import R_Login from './desktop/studentCom/R_Login';

import StudentMypage from './desktop/studentCom/StudentMypage';
import Loading from './desktop/loading';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <BrowserView>
      <Routes>
        <Route path='/' element={<Loading/>} />
        <Route path="/main" element={<Main />} />
        <Route path="/student" element={<Student/>} />
        <Route path="/student/Mypage" element={<StudentMypage/>} />
        
        <Route path="/stu" element={<R_Login/>} />
        <Route path="/teacher" element={<Teacher/>} />
        <Route path="/parents" element={<Parents/>} />
        <Route path="/m" element={<MainM/>} />
        <Route path="/student/Mypage" element={<MainM/>} />
        <Route path="*" element={<p>어라라.. 없는 주소인데</p>} />
      </Routes>
    </BrowserView>
    <MobileView>
      <Route path="/" element={<MainM/>}/>
    </MobileView>
  </Router>
);

reportWebVitals();
