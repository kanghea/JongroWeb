import StudentLogin from './studentCom/StudentLogin'
import isLogin from './lib/Islogin';
function Student() {
    const login_id = localStorage.getItem('login_id');
    return(
        <div>
        {isLogin 
        ? <StudentLogin/>
        : <div>{login_id}님! 안녕하세요!</div>
        }
        </div>
    )

}
export default Student;