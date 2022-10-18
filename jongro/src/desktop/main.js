import React, { useState, useEffect } from "react";
import Axios from "axios";
import HeaderBenner from './components/HeaderBenner';
import Title from './components/Title';
import Header from './components/Header';
import HeaderFixed from './components/HeaderFixed';
import Last from "./components/last";
import Act from './components/Act';

function Main() {
  const[movieName, setMoviename] = useState('');
  const[review, setReview] = useState('');
  Axios.defaults.withCredentials = true;
  const submitReview = ()=>{
    console.log(movieName)
    console.log(review)
    Axios.post('http://localhost:3001/api/insert',{
      movieName:movieName,
      movieReview:review
    }).then(()=>{alert('성공적으로 입력했습니다.')});
  };
  
  const [navbar, setNavbar] = useState(true);
  const changeheight = () => {
    if (window.scrollY > 0) {
      setNavbar(false);
    } else {
      setNavbar(true);
    }
  }
  window.addEventListener('scroll', changeheight)
  return (
    <div>
      <HeaderBenner />
      {navbar ? <Header /> : <HeaderFixed />}
      <Title />
      <Act />
      <Last />
    </div>
  );
}

export default Main;