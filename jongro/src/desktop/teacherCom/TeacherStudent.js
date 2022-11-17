import './Tlogin.css';
import { useEffect, useState } from 'react';
import { axiosInstance } from "../../config";
import './Tlogin.css';
function TeacherStudent() {
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
    
    const [Name, setName] = useState('');
    const [Grade, setGrade] = useState('');
    const [Rate, setRate] = useState('');
    const [Time, setTime] = useState('');
    const [Teacher, setTeacher] = useState('');
    const [Birthday, setBirthday] = useState('');
    const [Week, setWeek] = useState('');
    const [sclass, setsClass] = useState('');
 

    const submitLogin = () => {
        axiosInstance.post('http://localhost:3001/api/teacher/student', {
            Name: Name,
            Grade: Grade,
            Rate: Rate,
            Teacher: Teacher,
            Birthday: Birthday,
            Class:sclass

        }).then((res) => {
            if(res.data == "err"){
                alert("어라? 이게 왜 입력이 안되죠.. 강해를 호출해주세요!");
            }else{
                alert("입력이 완료됐습니다!");
                window.location.href = '/teacher/mypage'
            }
            
        }).catch(()=>{alert('어라.. 어째서 오류가..?')});
    };
    return (
        <div>
            <head>
                <meta charSet="UTF-8"></meta>
                <script src="jquery-3.4.1.js"></script>
            </head>
            <div class="body1">
                <section class="login-form">
                    <div className='flex justify-center items-center'>
                        <img alt='logoimg' src="../img/jongrologo.png" className='w-32 items-center'></img>
                    </div>
                    <from action="">
                        <div class="int-area">
                            <input type="text" name="id" id="id"
                                autoComplete='off' required onChange={(e) => { setName(e.target.value) }}></input>
                            <label for='id'>이름을 입력해주세요</label>
                        </div>
                        <div class="int-area">
                            <input type="text" name="pw" id="pw"
                                autoComplete='off' required onChange={(e) => { setGrade(e.target.value) }} />
                            <label for='pw'>학년을 입력해주세요</label>
                        </div>
                        <div class="int-area">
                            <input type="text" name="pw" id="pw"
                                autoComplete='off' required onChange={(e) => { setRate(e.target.value) }} />
                            <label for='pw'>요금이 어떻게 되나요?</label>
                        </div>
                        <div class="int-area">
                            <input type="text" name="pw2" id="pw2"
                                autoComplete='off' required onChange={(e) => { setTeacher(e.target.value) }} />
                            <label for='pw'>담당하는 선생님이 누군가요?</label>
                        </div>
                        <div class="int-area">
                            <input type="text" name="pw1" id="pw1"
                                autoComplete='off' required onChange={(e) => { setsClass(e.target.value) }} />
                            <label for='pw1'>반이 어떻게 되죠?</label>
                        </div>
                        <div class="int-area">
                            <input type="text" name="pw2" id="pw2"
                                autoComplete='off' required onChange={(e) => { setBirthday(e.target.value) }} />
                            <label for='pw'>생년월일을 알려주세요</label>
                        </div>
                        <div class="btn-area">
                            <button onClick={submitLogin}>입력하기!</button>
                        </div>
                    </from>
                </section>
            </div>
        </div>
    )

}
export default TeacherStudent;