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
    (function () {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken = (localStorage.getItem('access-token'));
        axios.post('http://162.248.101.98:3001/api/student/acc', {
            login_id: login_id,
            token: ACcesstoken
        }).then((res) => {
            if (res.data == null) {
                alert("로그인 하지 않으셨어요!")
                window.location.href = '/m'
            }
        });})()
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
                                 var comment = prompt(`${login_id}님의 소개를 입력해주세요!`, "");
                                 console.log(comment)
                                 if(comment == null){
                                    window.location.href = '/m/student/mypage'
                                 } else {
                                    axios.post('http://162.248.101.98:3001/api/comment/student', {
                                        login_id: login_id,
                                        comment: comment
                                    }).then(() => {
                                        window.localStorage.setItem('comment', comment);
                                        window.location.href = '/m/student/mypage'
                                    }).catch(()=>{
                                        window.localStorage.setItem('comment', comment);
                                        window.location.href = '/m/student/mypage'
                                    });
                                 }
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