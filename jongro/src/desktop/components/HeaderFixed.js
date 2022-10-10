import React, {component} from 'react';
function HeaderFixed() {
    return <>
    {
      <div className="sticky top-0 w-full h-[75px] backdrop-blur-xl drop-shadow-lg antialiased box-border" id="main-header">
        <div className="w-full h-full flex grow-0 bg-gray-50/80 justify-between items-center lg:px-52" id="main-header">
          <div className="flex-none basis-48 w-auto">
            <a href="/">
              <img alt="logo" src="img/jongrologo.png" className='h-[75px] w-auto'/>
            </a>
          </div>
          <div className="flex-none basis-96 w-72">
            <div className="text-xs flex flex-row">
              <a className="basis-48 color-white bg-orange-400 text-white border-solid rounded-3xl h-10 align-middle text-center pt-2 hover:bg-orange-500 text-sm border-2 border-orange-300" href="https://play.google.com/"><strong> 종로학원 학생모드 ➜</strong></a>
              <div className="basis-4"></div>
              <a className="basis-48 bg-white border-solid rounded-3xl h-10 align-middle text-center pt-2 hover:bg-slate-100 text-sm border-2 border-gray-300" href="/website"><strong>종로학원 선생님 모드 ➜</strong></a>
            </div> 
          </div>
        </div>
      </div>
    }
    </>
  } 
  export default HeaderFixed;