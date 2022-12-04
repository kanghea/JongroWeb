function Mypageheader(){
    const login_id = (localStorage.getItem('login_id'));
    return(
        <div id='header' className="flex px-3 py-2 justify-between border-b-2">
            <div alt='설정'>
                <img src="/img/option.png" className="w-7"/>
            </div>
            <div>
                {login_id}
            </div>
        </div>
    )
}

export default Mypageheader;