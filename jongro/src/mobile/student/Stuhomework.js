import Header from "./Header";
function Stuhomework() {


    return (
        <div>
            <Header />
            <div className="w-full h-full p-4 pt-[70px]">
                <div id='설문에 대한 설명' className="px-1 py-3 bg-gray-300 text-xs">
                    <div className="pb-1">
                        *이 설문지는 학생별 숙제실태를 파악하는 <br /> 내용입니다.
                    </div>
                    *응답하신 내용이 거짓일시 불이익이 있을 수 있습니다.
                </div>
                <div id='설문 문항 1' className="flex flex-col px-1 py-3 mt-3 border-b-2">
                    <div className="w-full bg-gray-400/25 border-b-gray-900">
                        1. 숙제를 다 완료 하였나요?
                    </div>
                    <div>
                        <input type="radio" name="list" value="1" className="left-10"></input>
                        예
                    </div>
                    <div>
                        <input type="radio" name="list" value="2" className="left-10"></input>
                        아니요
                    </div>
                </div>
                <div id='설문 문항 2'>
                    <div className="w-full bg-gray-400/25 border-b-blue-400">
                            2. 숙제를 하지 않았다면 <br></br>그 이유는 무엇인가요?
                        </div>
                        <div className="flex">
                            <input type="text" name="list1" className="border-2 w-full mt-3"></input>
                            
                        </div>
                    </div>
                <div id='설문 문항 3'>

                </div>
            </div>

        </div>
    )
}

export default Stuhomework;