function Header() {

    return (
        <div alt="header" className="flex h-12 flex-col fixed w-full">
            <div className="w-full flex justify-between items-center px-1 py-1">
                <div className="flex items-center h-full">
                    <div className="font-semibold text-xl text-black">JongroEdu</div>
                </div>
                <div>
                    menu
                </div>
            </div>
            <div className="w-full h-7 bg-slate-700 text-white flex justify-between px-1 items-center py-1 pb-1">
                <div className="text-sm">종로어시스턴트</div>
                <a className="text-xs" href="/m/student">처음으로</a>
            </div>
        </div>
    )
}

export default Header;