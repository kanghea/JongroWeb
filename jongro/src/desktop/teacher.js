import TeacherLogin from "./teacherCom/TeacherLogin";
import isLogin from "./lib/Islogin";
function Teacher(){
    const login_id = localStorage.getItem('login_id');
    return(
        <div>
            <div><TeacherLogin/></div>
        </div>
    )
}
export default Teacher;