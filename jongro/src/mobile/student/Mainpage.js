import Header from "./Header";

function Mainpage() {

    const login_id = (localStorage.getItem('login_id'));
    return (
        <div>
            <div alt="header" className="flex h-10 flex-col fixed w-full">
                <Header/>
                <div alt="네비게이션" className="pb-2 pt-16">
                    <div className="text-slate-600 font-semibold">서비스 목록</div>
                    <div className="text-slate-700 font-thin text-xs"> *업데이트가 지속적으로 이뤄질 예정입니다.</div>
                </div>
            </div>
            <div alt="content" className="px-1 pt-28">
                <a alt="숙제 자가진단" className="flex text-sm justify-between px-1 bg-blue-900 text-white rounded-lg h-20 pt-2 flex-col" href="/student/homework">
                    <div className="flex justify-between">
                        <div>숙제자가진단</div>
                        <div className="flex flex-col">
                            <div>미참여</div>
                        </div>
                    </div>
                    <div className="flex justify-between pr-24">
                        <div>{login_id} ㅣ</div>
                        <div>종로학원 고등 A반</div>
                    </div>
                </a>
            </div>
            <div alt="목록"></div>
        </div>
    )
}

export default Mainpage;