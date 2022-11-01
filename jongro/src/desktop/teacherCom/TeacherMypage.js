import {useState} from 'react';
import Axios from 'axios';
import Teacherheader from './Teacherheader';
import Teachermaincontent from './Teachercontent';
function StudentMypage(){    
    const login_id = (localStorage.getItem('login_id'));
    (function() {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken =(localStorage.getItem('access-token'));
        Axios.post('http://localhost:3001/api/teacher/acc', {
                login_id: login_id,
                token: ACcesstoken
            }).then((res) => {
                if(res.data == 'error'){
                    alert("로그인하지 않았어요! ")
                    window.location.href = '/teacher';
                } else{
                    console.log("로그인 승인")
                }
            });
    })();
    return(<div className='flex'>
            <Teacherheader/>
            <div className='ml-[280px] flex justify-center'>
                안녕
            </div>
        </div>)
}

export default StudentMypage;