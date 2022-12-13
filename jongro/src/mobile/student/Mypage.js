import Mypageheader from "./MypageHeader";
import Navbar from "./Navbar";

import axios from "axios";
import { RadarChart } from "./radar/RadaChart";
import { RadarData, RadarOptions } from "./radar/RadarConfig";
import { Radar } from "react-chartjs-2";
import { Chart } from "chart.js";



function Mypage(){
    const login_id = (localStorage.getItem('login_id'));
    const comment = (localStorage.getItem('comment'));

    return(
        <div>
            <Mypageheader/>
            <div alt='메인 프로필' className="flex flex-col px-3 border-b-2">
                <div className="flex justify-between py-3">
                        <div>
                            <img src="/img/boy.jpg" className="w-20 rounded-full"/>
                        </div>
                        <div className="flex flex-col w-2/3">
                            <div className="text-3xl font-sans pb-2">
                                {login_id}
                            </div>
                            <div className="w-full border-2 flex justify-center py-1" onClick={()=>{
                                prompt("소개")
                                axios.post('http://162.248.101.98:3001/api/login/student')
                              }}>
                                프로필 편집
                            </div>
                        </div>
                </div>
                <div className="flex flex-col py-5">
                    <div className="font-semibold">
                        {login_id}
                    </div>
                    <div>
                        {comment}
                    </div>
                </div>
            
            </div>
            <Navbar/>
        </div>
    )
}

export default Mypage;