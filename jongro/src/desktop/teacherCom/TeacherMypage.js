import { useState } from 'react';
import { axiosInstance } from "../../config";
import Teacherheader from './Teacherheader';
import Teachermaincontent from './Teachercontent';
function TeacherMypage() {
    const login_id = (localStorage.getItem('login_id'));
    (function () {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken = (localStorage.getItem('access-token'));
        axiosInstance.post('http://localhost:3001/api/teacher/acc', {
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
                <div className='flex p-3 bg-slate-500/5 w-full h-[120px] mt-10'>
                    <div className='h-full w-auto pr-2 border-r-2'>
                        초등SKY반
                    </div>
                    <div className='flex flex-col h-full'>
                        <div className='px-2'>
                            강해 O 관영 X 정원 O
                        </div>
                        <div className='px-2 h-full pt-12'>
                            수요일 6:30
                        </div>
                    </div>
                </div>

                <div className='flex p-3 bg-slate-500/5 w-full h-[120px] mt-10'>
                    <div className='h-full w-auto pr-2 border-r-2'>
                        초등SKY반
                    </div>
                    <div className='flex flex-col h-full'>
                        <div className='px-2'>
                            강해 O 관영 X 정원 O
                        </div>
                        <div className='px-2 h-full pt-12'>
                            수요일 6:30
                        </div>
                    </div>
                </div>

                <div className='flex p-3 bg-slate-500/5 w-full h-[120px] mt-10'>
                    <div className='h-full w-auto pr-2 border-r-2'>
                        초등SKY반
                    </div>
                    <div className='flex flex-col h-full'>
                        <div className='px-2'>
                            강해 O 관영 X 정원 O
                        </div>
                        <div className='px-2 h-full pt-12'>
                            수요일 6:30
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>)
}

export default TeacherMypage;