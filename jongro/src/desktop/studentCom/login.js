import './login.css';
import {useState} from 'react';

function Login() {
    const [id, setId] = useState(false);
    const [pw, setPw] = useState(false);
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
                                autoComplete='off' required onClick={() => {setId(true);}} />
                            <label for='id'>Username</label>
                        </div>
                        <div class="int-area">
                            <input type="password" name="pw" id="pw"
                                autoComplete='off' required onClick={() => {setPw(true);}}/>
                            <label for='pw'>password</label>
                        </div>
                        <div class="btn-area">
                            <button id='btn' type='submit' onClick={() => {if(id,pw == true){alert('성공')} else{alert('실패')}}}>로그인</button>
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