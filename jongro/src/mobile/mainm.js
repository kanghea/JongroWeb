import './mainm.css';
import {useState} from 'react';

function MainM() {
    const [student, setStudent] = useState(false);
    return(
        
        <div>
            <div>
                <div className='bg-white w-full h-10 p-1 shadow-sm fixed'>
                    <img src='img/jongrologo3.png' className='h-8 left-0'/>
                </div>
                <div className='w-full bottom-0 h-11 fixed flex justify-between px-10 text-slate-400 bg-black items-center'>
                    <span><div>학생</div></span><span><div>선생님</div></span><span><div>학부모</div></span>
                </div>
            </div>
        </div>
    )
}

export default MainM;