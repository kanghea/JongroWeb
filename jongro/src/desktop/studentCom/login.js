import './login.css';
import {useState} from 'react';
import Axios from 'axios';

function Login() {
    const [inputID, setInputId] = useState('');
    const [inputPW, setInputPw] = useState('');
    
    const submitLogin = ()=>{
        Axios.post('http://localhost:3001/api/login',{
          inputID:inputID,
          inputPW:inputPW
        }).then(()=>{alert('성공적으로 입력했습니다.')});
      };
    return(
        <div>
            <head>
                <meta charSet="UTF-8"></meta>
                <script src="jquery-3.4.1.js"></script>
            </head>
            <div class="body1">
                <section class="login-form">
                    <div className='flex justify-center'>
                        <img alt='logoimg' src="./img/jongrologo.png" className='w-32 items-center'></img>
                    </div>
                    <from action="">
                        <div class="int-area">
                            <input type="text" name="id" id="id"
                                autoComplete='off' required onChange={(e)=>{setInputId(e.target.value)}}></input>
                            <label for='id'>아이디를 입력해주세요!</label>
                        </div>
                        <div class="int-area">
                            <input type="password" name="pw" id="pw"
                                autoComplete='off' required onChange={(e)=>{setInputPw(e.target.value)}}/>
                            <label for='pw'>비밀번호를 입력해주세요!</label>
                        </div>
                        <div class="btn-area">
                            <button onClick={submitLogin}>누르시오</button>
                        </div>
                    </from>
                    <div class="caption">
                        <a href='/' className='hover:text-slate-500'>비밀번호를 잊어버리셨나요?</a>
                    </div>
                </section>
            </div>
        </div>
    )

}
export default Login;