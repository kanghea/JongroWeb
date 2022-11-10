import './mainm.css';
import { useState } from 'react';

import Axios from 'axios';

function LoginM() {
    const [inputPW, setInputPw] = useState('');
    const login_id = (localStorage.getItem('login_id'));

    (function () {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken =(localStorage.getItem('access-token'));
        Axios.post('http://localhost:3001/api/student/acc', {
                login_id: login_id,
                token: ACcesstoken
            }).then((res) => {
                if(res.data == 'Success'){
                    alert("이미 로그인 하셨어요!")
                    window.location.href='/m/student/'
                } else {
                    if(login_id == null){
                        window.location.href='/m'
                    }
                }
            });
    })();

    const submitLogin = () => {
        Axios.post('http://localhost:3001/api/login/student', {
            inputID: login_id,
            inputPW: inputPW
        }).then((res) => {
            if(res.data == "error"){
                alert("옳지 않아요!!");
            }else{
                alert("옳게 입력하셨네영!");
                localStorage.setItem('access-token' , `${res.data}`);
                window.location.href = '/student/homework';
            }
            
        }).catch(()=>{alert('어라.. 어째서 오류가..?')});
        

    };
    return (

        <div>
            <div className='w-full h-screen bg-blue-900'>
                <div className='flex justify-center items-center text-white h-full flex-col'>
                    <div className='flex justify-center flex-col align-middle text-center'>
                        <div className='flex justify-center'>
                            <img alt='logoimg' src="../img/jongrologo.png" className='w-32 items-center'></img>
                        </div>
                        <br></br>
                        <div className='text-xl font-semibold'>종로연구소</div>
                        <div>'{login_id}'님의 비밀번호를 입력하세요!</div>
                    </div>
                    <div className='flex'>
                        <div class='int-area1'>
                            <input type="password" name="pw" id="pw"
                                autoComplete='off' required onChange={(e) => { setInputPw(e.target.value) }} />
                            <label for='pw' className='text-white'>비밀번호를 입력해주세요!</label>
                        </div>
                        <div className='mt-6 text-xl items-center justify-center flex'>
                            <button onClick={submitLogin}>Go</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default LoginM;