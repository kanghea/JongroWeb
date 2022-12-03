import Header from "./Header";
import Nav from "./Nav";
import axios from 'axios';
import { useState } from "react";
function Mainpage() {

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
        });
        axios.post('http://162.248.101.98:3001/api/student/homework/acc', {
            login_id: login_id
        }).then((res) => {
            if (res.data == 'success') {
                window.localStorage.setItem('homework', "완료");
            } else {
                window.localStorage.setItem('homework', '미완료');
            }
        });
        axios.post('http://162.248.101.98:3001/api/student/class/acc', {
            login_id: login_id
        }).then((res) => {
            window.localStorage.setItem('class', `${res.data}`);
        });

    })();
    const login_id = (localStorage.getItem('login_id'));
    return (
        <div className="h-screen">
            <div alt="header" className="flex h-10 flex-col fixed w-full">
                <Header />
                <div alt="네비게이션" className="pb-2 pt-16">
                    <div className="text-slate-600 font-semibold">서비스 목록</div>
                    <div className="text-slate-700 font-thin text-xs"> *업데이트가 지속적으로 이뤄질 예정입니다.</div>
                </div>
            </div>
            <div alt="content" className="px-1 pt-28">
                <a alt="숙제 자가진단" className="flex text-sm justify-between px-1 bg-blue-800 text-white rounded-lg h-20 pt-2 flex-col hover:bg-blue-900" href="/m/student/homework">
                    <div className="flex justify-between">
                        <div>숙제자가진단</div>
                        <div className="flex flex-col">
                            <div>{localStorage.getItem('homework')}</div>
                        </div>
                    </div>
                    <div className="flex justify-between pr-24">
                        <div>{login_id} ㅣ{localStorage.getItem('class')}</div>
                    </div>
                </a>
            </div>
            <div alt="navbar" className="fixed flex w-full p-3 justify-between bottom-0">
                <div>홈</div>
                <div>통계</div>
                <div>랭킹</div>
            </div>
        </div>
    )
}

export default Mainpage;