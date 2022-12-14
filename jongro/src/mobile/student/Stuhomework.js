import { useState } from "react";
import Header from "./Header";
import axios from 'axios';
import Navbar from "./Navbar";
function Stuhomework() {
    (function() {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken =(localStorage.getItem('access-token'));
        axios.post('http://162.248.101.98:3001/api/student/acc', {
                login_id: login_id,
                token: ACcesstoken
            }).then((res) => {
                if(res.data == 'error'){
                    alert("로그인하지 않았어요! ")
                    window.location.href = '/m';
                } else{
                    console.log("로그인 승인")
                }
            });
    })();
    const [wh, Setwh] = useState('');
    const [what, Setwhat] = useState('');
    const login_id = (localStorage.getItem('login_id'));

    const handle = (e) => {
        console.log(e.target.value);
        Setwh(e.target.value);
    }
    const submit = (e) => {
        axios.post('http://162.248.101.98:3001/api/student/homework', {
            wh: wh,
            what: what,
            login_id: login_id
        }).then((res) => {
            if (res) {
                alert("숙제체크가 완료되었습니다.")
                window.location.href = '/m/student'
            }
        }).catch(() => { alert('어라.. 어째서 오류가..?') });
    }
    return (
        <div>
            <Header />
            <div className="w-full h-full p-4 pt-[70px]">
                <div id='설문에 대한 설명' className="px-1 py-3 bg-gray-300 text-xs">
                    <div className="pb-1">
                        *이 설문지는 학생별 숙제실태를 파악하는 내용입니다.
                    </div>
                    *응답하신 내용이 거짓일시 불이익이 있을 수 있습니다.
                </div>
                <div id='설문 문항 1' className="flex flex-col px-1 py-3 mt-3 border-b-2">
                    <div className="w-full bg-gray-400/25 border-b-gray-900">
                        1. 숙제를 했나요?
                    </div>
                    <div>
                        <input type="radio" name="list" value="1" className="left-10" onChange={handle}></input>
                        예
                    </div>
                    <div>
                        <input type="radio" name="list" value="2" className="left-10" onChange={handle}></input>
                        아니요
                    </div>
                </div>
                <div id='설문 문항 2' className="w-full">
                    <div className="w-full bg-gray-400/25 border-b-blue-400">
                        2. 숙제를 하지 않았다면 <br></br>그 이유는 무엇인가요?
                    </div>
                    <div className=" w-full">
                        <input type="text" className="border-2 w-full h-8"
                            autoComplete='off' required onChange={(e) => { Setwhat(e.target.value) }} />
                    </div>
                </div>
                <div className="px-10 mt-3">
                    <div className="px-1 py-1 bg-blue-600/90 flex justify-center text-white font-bold rounded-lg" onChange={(e) => { console.log(e.target.value) }}>
                        <button onClick={submit}>입력하기!</button>
                    </div>
                </div>

            </div>
            <Navbar/>

        </div>
    )
}

export default Stuhomework;