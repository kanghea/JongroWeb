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
        })
        axios.post('http://162.248.101.98:3001/api/login/student/comment', {
            inputID: login_id
        }).then((res) => {
            if (res.data == "error") {
                var comment = prompt(`${login_id}님의 소개를 입력해주세요!`, "");
                console.log(comment)
                axios.post('http://162.248.101.98:3001/api/comment/student', {
                    login_id: login_id,
                    comment: comment
                }).then(() => {
                    window.localStorage.setItem('comment', comment);
                });
            } else {
                localStorage.setItem('comment', `${res.data}`);
            }
        });

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
                <Link alt="숙제 자가진단" className="flex text-sm justify-between px-1 bg-blue-900 text-white rounded-lg h-20 pt-2 flex-col hover:animate-pulse" to="/m/student/homework">
                    <div className="flex justify-between">
                        <div>숙제자가진단</div>
                        <div className="flex flex-col">
                            <div>{localStorage.getItem('homework')}</div>
                        </div>
                    </div>
                    <div className="flex justify-between pr-24">
                        <div>{login_id} ㅣ{localStorage.getItem('Class')}</div>
                    </div>
                </Link>
            </div>
            <Navbar />
        </div>
    )
}

export default Mainpage;