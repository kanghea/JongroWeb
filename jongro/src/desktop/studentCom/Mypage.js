import {useState} from 'react';
import isLogin from '../lib/Islogin';
function Mypage(){    
    const login_id = localStorage.getItem('login_id');

    return(<div>
        {isLogin 
        ? <div>안녕하세요 {login_id}님!</div> 
        : <div>로그인을 안하셨어요!</div>
        }
        </div>)
}

export default Mypage;