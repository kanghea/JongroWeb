import TeacherLogin from "./teacherCom/TeacherLogin";
import isLogin from "./lib/Islogin";
function Teacher(){
    const login_id = localStorage.getItem('login_id');
    return(
        <div>
        {isLogin 
        ? <div>안녕하세요 {login_id}님!</div> 
        : <div><TeacherLogin/></div>
        }
        </div>
    )
}
export default Teacher;