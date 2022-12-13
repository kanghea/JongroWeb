import Mypageheader from "./MypageHeader";
import Navbar from "./Navbar";

import { Radar } from 'react-chartjs-2';
import axios from "axios";
import { RadarChart } from "./radar/RadaChart";

function Mypage(){
    const login_id = (localStorage.getItem('login_id'));
    const comment = (localStorage.getItem('comment'));
    const data3 = {
        labels: ['Thing 1', 'Thing 2', 'Thing 3', 'Thing 4', 'Thing 5', 'Thing 6'],
        datasets: [
          {
            label: '# of Votes',
            data: [2, 9, 3, 5, 2, 3],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      };
      const config = {
        type: 'radar',
        data: data3,
        options: {
          elements: {
            line: {
              borderWidth: 3
            }
          }
        },
      };
      
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
                <RadarChart />
            </div>
            <Navbar/>
        </div>
    )
}

export default Mypage;