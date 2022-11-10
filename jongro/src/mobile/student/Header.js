function Header() {

    return (
        <div alt="header" className="flex h-10 flex-col fixed w-full">
            <div className="w-full flex justify-between items-center px-1 py-1">
                <div className="flex items-center h-full">
                    <img src="/img/jongro.png" className="w-6 h-auto" />
                    <div className="font-medium text-md">종로학원</div>
                </div>
                <div>
                    menu
                </div>
            </div>
            <div className="w-full h-5 bg-slate-700 text-white flex justify-between px-1 items-center">
                <div className="text-sm">종로어시스턴트</div>
                <div className="text-xs">처음으로</div>
            </div>
        </div>
    )
}

export default Header;