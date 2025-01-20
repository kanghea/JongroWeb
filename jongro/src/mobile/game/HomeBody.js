import React from "react";
import { Link } from "react-router-dom";

export default function HomeBody() {
  return (
    <div className="w-full min-h-screen bg-[#3A3A3A] text-white flex">
      {/* 왼쪽 사이드바 */}
      <div className="w-64 bg-[#2B2B2B] flex flex-col items-start p-4 space-y-4">
        {/* 상단 프로필 / 계급 아이콘 (임시) */}
        <div className="flex items-center space-x-2">
          {/* 아이콘 자리 */}
          <div className="w-8 h-8 bg-gray-600 rounded" />
          <div className="text-lg font-bold">#12 플레이</div>
          <div className="text-sm">137</div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-600 rounded" />
          <div className="text-lg font-bold">퍼즐</div>
          <div className="text-sm">418🔥2</div>
        </div>

        {/* 새 게임 버튼 */}
        <Link
          to="/m/game"
          className="w-full px-2 py-2 bg-[#3B3B3B] hover:bg-[#4B4B4B] rounded"
        >
          새 게임
        </Link>

        {/* 봇과 플레이 */}
        <Link
          to="/m/game/computer"
          className="w-full px-2 py-2 bg-[#3B3B3B] hover:bg-[#4B4B4B] rounded"
        >
          봇과 플레이
        </Link>

        {/* 친구와 플레이하기 */}
        <button className="w-full px-2 py-2 bg-[#3B3B3B] hover:bg-[#4B4B4B] rounded">
          친구와 플레이하기
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-auto">
        {/* 상단 카드 영역 */}
        <div className="flex space-x-4">
          {/* 퍼즐 풀기 */}
          <div className="bg-[#2B2B2B] w-1/3 rounded p-2 flex flex-col items-center space-y-2">
            <div className="w-full h-32 bg-green-600">이미지(퍼즐)</div>
            <div className="text-sm font-bold">퍼즐 풀기</div>
          </div>

          {/* 레슨 시작 */}
          <div className="bg-[#2B2B2B] w-1/3 rounded p-2 flex flex-col items-center space-y-2">
            <div className="w-full h-32 bg-blue-600">이미지(레슨)</div>
            <div className="text-sm font-bold">레슨 시작</div>
          </div>

          {/* 리뷰 vs barahana */}
          <div className="bg-[#2B2B2B] w-1/3 rounded p-2 flex flex-col items-center space-y-2">
            <div className="w-full h-32 bg-yellow-600">이미지(리뷰)</div>
            <div className="text-sm font-bold">리뷰 vs barahana</div>
          </div>
        </div>

        {/* 광고 배너 자리 */}
        <div className="bg-[#2B2B2B] h-20 rounded flex items-center justify-center">
          <div className="text-sm text-gray-300">광고 자리 (예: Disney+)</div>
        </div>

        {/* 일일 게임 / 추천 상대 영역 */}
        <div>
          <h2 className="text-lg font-bold mb-2">일일 게임 (0)</h2>

          <div className="bg-[#2B2B2B] p-2 rounded flex flex-col space-y-2">
            <div className="flex space-x-2 items-center">
              {/* 체스판 미리보기 */}
              <div className="w-16 h-16 bg-gray-500 rounded" />
              {/* 상대 정보 */}
              <div className="flex flex-col">
                <span className="font-bold">추천 상대</span>
                <span className="text-sm">barahana (400)</span>
                <span className="text-xs text-gray-300">New Friend</span>
              </div>
              <button className="ml-auto bg-green-700 hover:bg-green-800 px-3 py-1 rounded">
                도전
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
