const isLogin = () => !!localStorage.getItem('access-Token');

export default isLogin;