import './login.css';
import { useEffect, useState } from 'react';
import Axios from 'axios';
(function () {
    const login_id = (localStorage.getItem('login_id'));
    const ACcesstoken =(localStorage.getItem('access-token'));
    Axios.post('http://localhost:3001/api/student/acc', {
            login_id: login_id,
            token: ACcesstoken
        }).then((res) => {
            if(res.data == 'success'){
                window.location.href='/student/Mypage'
            }
        }).catch(()=>{alert('아무일도.. 없었다.')});
})();
function StudentLogin() {
    const [inputID, setInputId] = useState('');
    const [inputPW, setInputPw] = useState('');
    const [accesstoken, setAccessToken] = useState('');

    const submitLogin = () => {
        Axios.post('http://localhost:3001/api/login/student', {
            inputID: inputID,
            inputPW: inputPW
        }).then((res) => {
            if(res.data == "error"){
                alert("옳지 않아요!!");
            }else{
                alert("옳게 입력하셨네영!");
                setAccessToken(res.data);
                console.log(accesstoken);
                localStorage.setItem('login_id' , `${inputID}`);
                localStorage.setItem('access-token' , `${accesstoken}`);
                window.location.href='/student/Mypage';
            }
            
        }).catch(()=>{alert('어라.. 어째서 오류가..?')});
        

    };
    const submitwhere = () => {
        alert("관리자에게 문의해주세요!")
    }
    return (
        <div>
            <head>
                <meta charSet="UTF-8"></meta>
                <script src="jquery-3.4.1.js"></script>
            </head>
            <div class="body1">
                <section class="login-form">
                    <a className='flex justify-center' href='/'>
                        <img alt='logoimg' src="./img/jongrologo.png" className='w-32 items-center'></img>
                    </a>
                    <from action="">
                        <div class="int-area">
                            <input type="text" name="id" id="id"
                                autoComplete='off' required onChange={(e) => { setInputId(e.target.value) }}></input>
                            <label for='id'>아이디를 입력해주세요!</label>
                        </div>
                        <div class="int-area">
                            <input type="password" name="pw" id="pw"
                                autoComplete='off' required onChange={(e) => { setInputPw(e.target.value) }} />
                            <label for='pw'>비밀번호를 입력해주세요!</label>
                        </div>
                        <div class="btn-area">
                            <button onClick={submitLogin}>로그인</button>
                        </div>
                    </from>
                    <div class="caption">
                        <button className='hover:text-slate-500 text-gray-400' onClick={submitwhere}>비밀번호를 잊어버리셨나요?</button>
                    </div>
                </section>
            </div>
        </div>
    )

}
export default StudentLogin;