import './mainm.css';

import { useState } from 'react';

import axios from 'axios';
import { Link } from 'react-router-dom';

function Login() {
    const [inputPW, setInputPw] = useState('');
    const [inputID, setInputID] = useState('');
    
    (function () {
        const login_id = (localStorage.getItem('login_id'));
        const ACcesstoken =(localStorage.getItem('access-token'));
        axios.post('http://162.248.101.98:3001/api/student/acc', {
                login_id: login_id,
                token: ACcesstoken
            }).then((res) => {
                if(res.data == 'success'){
                    alert("이미 로그인 하셨어요!")
                    window.location.href='/m/student'
                } else{
                    if(login_id != null){
                        window.location.href='/m/acc'
                    }
                }
            });
    })();

    const submitLogin = () => {
        axios.post('http://162.248.101.98:3001/api/login/student', {
            inputID: inputID,
            inputPW: inputPW
        }).then((res) => {
            if(res.data == "error"){
                alert("옳지 않아요!!");
            }else{
                alert("옳게 입력하셨네영!");
                localStorage.setItem('login_id' , `${inputID}`);
                localStorage.setItem('access-token' , `${res.data[0]}`);
                localStorage.setItem('Class' , `${res.data[1]}`);
                window.location.href = '/m/student';
            }
            
        }).catch(()=>{alert('어라.. 어째서 오류가..?')});
        

    };
    return (

        <div class="bo">
            <div className='w-full h-screen bg-blue-900'>
                <div className='flex justify-center items-center text-white h-full flex-col'>
                    <div className='flex justify-center flex-col align-middle text-center'>
                        <div className='flex justify-center'>
                            <img alt='logoimg' src="../img/jongrologo.png" className='w-32 items-center'></img>
                        </div>
                        <br></br>
                        <div className='text-2xl font-semibold'>학생모드</div>
                        <div class='int-area1'>
                            <input type="Text" name="id" id="id"
                                autoComplete='off' required onChange={(e) => { setInputID(e.target.value) }} />
                            <label for='pw' className='text-white'>아이디를 입력해주세요!</label>
                        </div>
                    </div>
                    <div className='flex ml-6'>
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
            <div className='fixed bottom-0 text-white flex justify-between w-full px-20 py-5 text-xl font-medium'>
                <Link onClick={()=>{alert("아직 구현되지 않았어요!")
                    window.location.href='/m'}}>학부모</Link>
                <Link to='/m/admin'>관리자</Link>
            </div>
        </div>
    )
}

export default Login;