import Header from "./Header";
import Nav from "./Nav";
import axios from 'axios';
import { useState } from "react";
import Navbar from "./Navbar";
import { Route, Link } from 'react-router-dom';
function Mainpage() {

    (function () {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken = (localStorage.getItem('access-token'));
        axios.post('http://162.248.101.98:3001/api/admin/acc', {
            login_id: login_id,
            token: ACcesstoken
        }).then((res) => {
            if (res.data == null) {
                alert("로그인 하지 않으셨어요!")
                window.location.href = '/m/teacher'
            }
        });
        axios.post('http://162.248.101.98:3001/api/admin/homework').then((res)=>{
                
            }
        )

    })();
    const login_id = (localStorage.getItem('login_id'));
    const Class = (localStorage.getItem('Class'));
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
                <div></div>
            </div>
        </div>
    )
}

export default Mainpage;