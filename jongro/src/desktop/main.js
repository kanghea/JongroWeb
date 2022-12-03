import React, { useState, useEffect } from "react";
import { axiosInstance } from "../config";
import HeaderBenner from './components/HeaderBenner';
import Title from './components/Title';
import Header from './components/Header';
import HeaderFixed from './components/HeaderFixed';
import Last from "./components/last";
import Act from './components/Act';

function Main() {
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
    </div>
  );
}

export default Main;