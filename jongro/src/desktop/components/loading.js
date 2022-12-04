import { BrowserView, MobileView } from 'react-device-detect';
function Loading() {
    (function () {
        if (window.innerWidth > 720) {
            window.location.href = '/main';
        } 
    })();
    setTimeout(() => {
        window.location.href = '/m';
    }, 3000);
    return (
        <div>
            <BrowserView>
                <div className="w-screen h-screen flex justify-center">
                    <img alt="이미지" src="img/loading.png" className="w-auto h-screen" />
                </div>
            </BrowserView>
            <MobileView>
                <div className="h-screen text-white/80">
                    <img src='/img/Mbackground.png' className='h-full w-full z-0 fixed'/>
                    <div alt="배경" className='w-full h-full flex pt-20 pl-10 flex-col z-10 relative'>
                        <div>
                            <img src='img/jongrologo2.png' className='h-12' />
                        </div>
                        <div className='text-3xl pt-20'>
                            <div className='font-normal'>2023년도</div>
                            <div className='font-semibold'>종로학원과 함께</div>
                        </div>
                        <div>
                            JongroEdu
                        </div>
                    </div>
                </div>
            </MobileView>
        </div>)
}

export default Loading;