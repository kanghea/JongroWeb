function Loading(){
    setTimeout(() => {window.location.href='/main';}, 3000);
    return(
    <div className="w-screen h-screen">
        <img src="public/img/loading.png" className="w-full h-full"/>  
    </div>)
}

export default Loading;