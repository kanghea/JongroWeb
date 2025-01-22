import React from 'react';

function Login() {
  const handleKakaoLogin = () => {
    console.log('카카오 로그인 시도');
    // 실제 카카오 로그인 연동 로직을 추가하세요
  };

  const handleGoogleLogin = () => {
    console.log('구글 로그인 시도');
    // 실제 구글 로그인 연동 로직을 추가하세요
  };

  const handleEmailLogin = () => {
    console.log('이메일 로그인 시도');
    // 이메일 로그인/회원가입 로직 또는 페이지 이동을 추가하세요
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* 제목 */}
      <h1 className="text-2xl font-bold mb-8 text-[#d54b3d]">
        오목조목
      </h1>

      {/* 카카오 로그인 버튼 */}
      <button
        onClick={handleKakaoLogin}
        className="
          w-64 py-3 mb-3 
          rounded-lg 
          bg-[#FEE500] text-black font-semibold
          hover:bg-[#FDDC3F]
          transition-colors
        "
      >
        카카오로 로그인
      </button>

      {/* 구글 로그인 버튼 */}
      <button
        onClick={handleGoogleLogin}
        className="
          w-64 py-3 mb-3 
          rounded-lg 
          bg-white text-black font-semibold
          border border-gray-300
          hover:bg-gray-100
          transition-colors
        "
      >
        구글로 로그인
      </button>

      {/* 이메일 로그인 버튼 */}
      <button
        onClick={handleEmailLogin}
        className="
          w-64 py-3 mb-3 
          rounded-lg 
          bg-[#4F5665] text-white font-semibold
          hover:bg-[#3F4655]
          transition-colors
        "
      >
        이메일로 로그인
      </button>

      {/* 안내 문구 */}
      <p className="text-sm text-gray-500 text-center mt-4">
        로그인이 이루어지면 뀨투코리아가 공지하는&nbsp;
        서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
      </p>
    </div>
  );
}

export default Login;
