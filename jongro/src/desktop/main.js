import React, { useState } from "react";
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
      <Last />
      <div className="flex flex-col items-center justify-center">
        <input type={"text"} name="movieName" className="bg-black w-80 h-20"></input>
        <input type={"text"} name="review" className="bg-yellow-300 w-80 h-20"></input>
        <button>누르시오</button>
      </div>


    </div>
  );
}

export default Main;