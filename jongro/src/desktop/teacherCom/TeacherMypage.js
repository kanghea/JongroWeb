import { useState } from 'react';
import Axios from 'axios';
import Teacherheader from './Teacherheader';
import Teachermaincontent from './Teachercontent';
function TeacherMypage() {
    const login_id = (localStorage.getItem('login_id'));
    (function () {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken = (localStorage.getItem('access-token'));
        Axios.post('http://localhost:3001/api/teacher/acc', {
            login_id: login_id,
            token: ACcesstoken
        }).then((res) => {
            if (res.data == 'error') {
                alert("로그인하지 않았어요! ")
                window.location.href = '/teacher';
            } else {
                console.log("로그인 승인")
            }
        });

    })();
    const submitlogout = () => {
        window.localStorage.removeItem('access-token');
        window.location.href = '/main'
    }
    return (<div className='flex'>
        <Teacherheader />
        <div className='ml-[280px] flex justify-center w-[1239.2px] h-[1239.2px]'>
            <div className='lg:p-[30px] flex flex-col'>
                <div className='w-full text-right'>
                    <div className="w-full flex justify-between">
                        <div className='w-1'></div>
                        <div className='w-40 flex items-center justify-between'><div className='w-auto flex items-center text-center'><img src="../img/menu.png" className="w-5" alt="설정창" />개인정보</div><div><button onClick={submitlogout}><div className='flex align-middle text-center items-center'><i class="fa-solid fa-bell mr-3"></i>알림</div></button></div></div>
                    </div>
                </div>

                <img src='../img/banner1.png' className='rounded-md mt-3 shadow-md' />
                <ul className='flex justify-between align-middle items-center h-auto mt-5'>
                    <li className='flex justify-center bg-slate-300 w-full mr-5 h-full text-center items-center p-3'>

                    </li>
                    <li className='flex justify-center bg-slate-300 w-full mr-5 h-full p-3'>2</li>
                    <li className='flex justify-center bg-slate-300 w-full mr-5 h-full items-center'>3</li>
                    <li className='flex justify-center bg-slate-300 w-full h-full items-center'>4</li>
                </ul>
            </div>
        </div>
    </div>)
}

export default TeacherMypage;