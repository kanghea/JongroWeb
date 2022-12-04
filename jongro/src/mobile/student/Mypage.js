import Mypageheader from "./MypageHeader";
import Navbar from "./Navbar";

function Mypage(){
    const login_id = (localStorage.getItem('login_id'));
    return(
        <div>
            <Mypageheader/>
            <div alt='메인 프로필' className="flex flex-col px-3 border-b-2">
                <div className="flex justify-between py-3">
                        <div>
                            메인이미지
                        </div>
                        <div className="flex flex-col w-2/3">
                            <div className="text-3xl font-sans pb-2">
                                {login_id}
                            </div>
                            <div className="w-full border-2 flex justify-center py-1">
                                프로필 편집
                            </div>
                        </div>
                </div>
                <div className="flex flex-col py-5">
                    <div className="font-semibold">
                        {login_id}
                    </div>
                    <div>
                        전교일등
                    </div>
                </div>
            </div>
            <Navbar/>
        </div>
    )
}

export default Mypage;