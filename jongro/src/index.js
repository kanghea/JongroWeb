import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './desktop/main';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { BrowserView, MobileView } from 'react-device-detect';

import Student from './desktop/student';
import Teacher from './desktop/teacher';
import Parents from './desktop/Parents';
import MainM from './mobile/mainm';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <BrowserView>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/student" element={<Student/>} />
        <Route path="/teacher" element={<Teacher/>} />
        <Route path="/parents" element={<Parents/>} />
        <Route path="/m" element={<MainM/>} />
      </Routes>
    </BrowserView>
    <MobileView>
      <Route path="/" element={<MainM/>}/>
    </MobileView>
  </Router>
);

reportWebVitals();
