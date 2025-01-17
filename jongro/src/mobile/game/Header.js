import React from "react";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#2B2B2B]">
      {/* 좌측 플레이어 정보 (예시: Nora) */}
      <div className="flex items-center space-x-2 text-white">
        {/* 플레이어 이미지 (추후 교체 가능) */}
      </div>

      {/* 게임 로고 / 제목 (중앙) */}
      <div className="text-gray-100 font-bold text-lg">
        오목 게임 (Chess.com Style)
      </div>

      {/* 우측 공간 (비어있거나 옵션 버튼 등) */}
      <div className="text-white">
        {/* 필요시 여기에 아이콘/메뉴 버튼 배치 가능 */}
      </div>
    </header>
  );
}
