const isLogin = () => !!localStorage.getItem('access-token');

export default isLogin;