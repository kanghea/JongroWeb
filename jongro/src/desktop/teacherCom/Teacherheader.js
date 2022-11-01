function Teacherheader(){
    const login_id = (localStorage.getItem('login_id'));
    const submitlogout = () => {
        window.localStorage.clear();
        window.location.href = '/main'
    }
    return(
        <div className="flex flex-col fixed w-[280px] shadow-lg h-full">
            <div className="p-3 h-24 box-border flex justify-center">
                <a href="/main">
                    <img src="../img/jongrologo2.png" className="h-full"/>
                </a>
            </div>
            <div className="p-2 mx-3 bg-[#f8f8f8] border-2">
                <div className="flex justify-between">
                    <div className="w-20 flex float-left items-center justify-between"><img src="../img/teacher.png" className="w-5" alt="선생님 이미지"/>{login_id}<img src="../img/menu.png" className="w-5" alt="설정창"/></div><div><button onClick={submitlogout}><img src="../img/logout.png" alt="로그아웃" className="w-[22px] pt-2"/></button></div>
                </div>
            </div>
            <div className="mx-3 box-border h-24 align-middle items-center border-t-0">
                <div className="w-full flex flex-row justify-between h-10 border-x-2">
                    <div className="w-1/2 flex justify-center align-middle items-center border-b-2 border-r-2">학생관리</div><div className="w-1/2 flex justify-center align-middle items-center border-b-2">성적관리</div>
                </div>
                <div className="w-full flex flex-row justify-between h-10 border-x-2">
                    <div className="w-1/2 flex justify-center align-middle items-center border-b-2 border-r-2">코멘트</div><div className="w-1/2 flex justify-center align-middle items-center border-b-2">숙제</div>
                </div>
            </div>
            <ul className="overflow-x-hidden overflow-y-scroll m-0 border-t-[1px] text-left pl-5 flex flex-col justify-between h-auto w-full">
                <li className="h-40 items-center block">
                    1
                </li>
                <li className="h-40 items-center block">
                    1
                </li>
                <li className="h-40 items-center block">
                    1
                </li>
                <li className="h-40 items-center block">
                    1
                </li>
                <li className="h-40 items-center block">
                    1
                </li>
                <li className="h-40 items-center block">
                    1
                </li>
                <li className="h-40 items-center block">
                    1
                </li>
                
            </ul>
        </div>
    )
}

export default Teacherheader;