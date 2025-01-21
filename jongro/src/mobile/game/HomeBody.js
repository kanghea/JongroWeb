////////////////////////////////////////
// src/mobile/game/HomeBody.js
////////////////////////////////////////
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// 서버 주소 (본인 PC IP나 도메인)
const socket = io("http://192.168.0.22:3001");

export default function HomeBody() {
  const navigate = useNavigate();

  // 대기중인 방 목록
  const [waitingRooms, setWaitingRooms] = useState([]);

  // 소켓 이벤트 중복 등록 방지
  const didSetupRef = useRef(false);

  useEffect(() => {
    // 연결은 이미 되어있다고 가정. 여기서 이벤트 등록
    if (!didSetupRef.current) {
      didSetupRef.current = true;

      // 대기방 목록 수신
      socket.on("waitingRooms", (rooms) => {
        console.log("받은 waitingRooms:", rooms);
        setWaitingRooms(rooms);
      });
    }

    // 컴포넌트가 마운트될 때 서버에 대기 중인 방 목록 요청
    socket.emit("requestWaitingRooms");

    return () => {
      // cleanup if needed
    };
  }, []);

  // "도전" 버튼 => /m/game/:roomId?timeChoice=...&nickname=...
  function handleChallenge(roomId, timeMode) {
    // 닉네임은 일단 "Guest" 예시, 필요시 입력받거나 저장 가능
    const myNick = "Challenger";
    // timeMode= e.g. 60(1분), 180(3분)...

    // timeMode-> "3분"/"5분" 은 서버에서 해석했지만, 
    // 여기서는 역매핑이 필요하면 하거나, 
    // 그냥 1분/3분등 문자열로 넘겨도 됨.
    let timeChoiceStr = "1분";
    if (timeMode === 180) timeChoiceStr = "3분";
    else if (timeMode === 300) timeChoiceStr = "5분";

    // 이동
    navigate(`/m/game/${roomId}?timeChoice=${timeChoiceStr}&nickname=${myNick}`);
  }

  return (
    <div className="w-full min-h-screen bg-[#3A3A3A] text-white flex">
      {/* 왼쪽 사이드바 */}
      <div className="w-64 bg-[#2B2B2B] flex flex-col items-start p-4 space-y-4">
        {/* 상단 프로필 / 계급 아이콘 (임시) */}
        <div className="flex items-center space-x-2">
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

        {/* 일일 게임 / 대기중인 방 목록 */}
        <div>
          <h2 className="text-lg font-bold mb-2">
            일일 게임 ({waitingRooms.length})
          </h2>

          <div className="bg-[#2B2B2B] p-2 rounded flex flex-col space-y-2">
            {waitingRooms.length === 0 ? (
              <div className="text-gray-400 text-sm">
                현재 대기중인 방이 없습니다.
              </div>
            ) : (
              waitingRooms.map((room, idx) => {
                // 방에 가입한 첫번째 플레이어 닉네임? (players[0]) or ???
                const player = room.players[0];
                const nickname = player ? player.nickname : "??";
                // timeMode가 60이면 1분, 180=3분, ...
                let timeLabel = "1분";
                if (room.timeMode === 180) timeLabel = "3분";
                else if (room.timeMode === 300) timeLabel = "5분";

                return (
                  <div key={idx} className="flex space-x-2 items-center">
                    {/* 체스판 미리보기/이미지 자리에 일단 회색 */}
                    <div className="w-16 h-16 bg-gray-500 rounded" />
                    {/* 상대 정보 */}
                    <div className="flex flex-col">
                      <span className="font-bold">{nickname}</span>
                      <span className="text-sm">{timeLabel}</span>
                      <span className="text-xs text-gray-300">
                        RoomID: {room.roomId}
                      </span>
                    </div>
                    {/* 도전 버튼 */}
                    <button
                      onClick={() => handleChallenge(room.roomId, room.timeMode)}
                      className="ml-auto bg-green-700 hover:bg-green-800 px-3 py-1 rounded"
                    >
                      도전
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
