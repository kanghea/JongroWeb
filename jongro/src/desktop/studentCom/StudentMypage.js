import {useState} from 'react';
import axios from 'axios';
function StudentMypage(){    
    (function() {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken =(localStorage.getItem('access-token'));
        axios.post('http://162.248.101.98:3001/api/student/acc', {
                login_id: login_id,
                token: ACcesstoken
            }).then((res) => {
                if(res.data == 'error'){
                    alert("로그인하지 않았어요! ")
                    window.location.href = '/student';
                } else{
                    console.log("로그인 승인")
                }
            });
    })();
    return(
        <div>
            
        </div>)
}

export default StudentMypage;