function Navbar() {

    return (
        <div alt="navbar" className="fixed flex w-full p-2 justify-between bottom-0 border-t-2">
            <a href="/m/student" className="flex flex-col justify-center items-center text-sm">
                <img src="/img/homeicon.png" className="w-5" />
                홈
            </a>
            <a className="flex flex-col justify-center items-center text-sm">
                <img src="/img/통계.png" className="w-5" />
                통계
            </a>
            <a className="flex flex-col justify-center items-center text-sm align-middle w-14 h-14">
                    <img src="/img/QnA.png" className="w-6 z-10"/>
                    QnA
            </a>
            <a className="flex flex-col justify-center items-center text-sm">
                    <img src="/img/랭킹.png" className="w-5" />
                    랭킹
            </a>
            <a href="/m/student/mypage" className="flex flex-col justify-center items-center text-sm">
                    <img src="/img/나.png" className="w-5" />
                    나
            </a>
        </div>
    )
}

export default Navbar;