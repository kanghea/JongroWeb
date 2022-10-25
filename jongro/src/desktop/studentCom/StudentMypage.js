import {useState} from 'react';
import Axios from 'axios';
(function () {
    const login_id = (localStorage.getItem('login_id'));
    const ACcesstoken =(localStorage.getItem('access-token'));
    Axios.post('http://localhost:3001/api/student/acc', {
            login_id: login_id,
            token: ACcesstoken
        }).then((res) => {
            if(res.data == 'error'){
                window.location.href='/student'
            } else{
                console.log("로그인 승인")
            }
        }).catch(()=>{alert('아무일도.. 없었다.')});
})();

function StudentMypage(){    

    return(<div>
        안녕
        </div>)
}

export default StudentMypage;