////////////////////////////////////////
// src/mobile/game/HomeBody.js
////////////////////////////////////////
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../socket";

// 자물쇠 아이콘
import lockIcon from "../images/rock.png";
import unlockIcon from "../images/unrock.png";

// (임의) 프로필 아바타 예시 이미지
import myAvatar from "../images/player1.png"; // 본인의 실제 이미지 경로 사용

// 싱글톤 소켓
const socket = getSocket();

export default function HomeBody() {
  const navigate = useNavigate();

  // 대기 중인 방 목록
  const [waitingRooms, setWaitingRooms] = useState([]);
  // 접속자 목록(실제 서버에서 받아옴)
  const [userList, setUserList] = useState([]);

  // (예시) 내 정보
  const [myInfo, setMyInfo] = useState({
    nickname: "패션테라피스트", // 예시
    totalWins: 0,
    time: 0,
    level: 1,
    exp: 0,
    expMax: 120
  });

  // 소켓 이벤트 중복 등록 방지
  const didSetupRef = useRef(false);

  useEffect(() => {
    if (!didSetupRef.current) {
      didSetupRef.current = true;

      // 대기 중인 방 목록 수신
      socket.on("waitingRooms", (rooms) => {
        console.log("받은 waitingRooms:", rooms);
        setWaitingRooms(rooms);
      });

      // 접속자 목록 수신
      socket.on("onlineUsers", (list) => {
        console.log("받은 onlineUsers:", list);
        setUserList(list);
      });

      // 서버에서 "myInfo" 같은 이벤트로 내 정보를 준다면:
      // socket.on("myInfo", (data) => setMyInfo(data));
    }

    // 마운트 시: 서버에 목록 요청
    socket.emit("requestWaitingRooms");
    socket.emit("requestOnlineUsers");
    // socket.emit("requestMyInfo"); // 필요시

    return () => {
      // cleanup if needed
      // socket.off("waitingRooms");
      // socket.off("onlineUsers");
    };
  }, []);

  /** "방 만들기" 클릭 => /m/game (방 만들기 화면) */
  function handleCreateRoom() {
    navigate("/m/game");
  }

  /** "빠른 입장" */
  function handleQuickJoin() {
    alert("빠른 입장: 아직 구현되지 않았습니다!");
  }

  /** "상점" */
  function handleShop() {
    alert("상점: 아직 구현되지 않았습니다!");
  }

  /** 나머지 탭들 */
  function handleDictionary() {
    alert("사전: 아직 구현되지 않았습니다!");
  }
  function handleReplay() {
    alert("리플레이: 아직 구현되지 않았습니다!");
  }
  function handleRanking() {
    alert("랭킹: 아직 구현되지 않았습니다!");
  }

  /** 방 입장 => /m/game/:roomId?timeChoice=... */
  function handleChallenge(roomId, timeMode) {
    let timeChoiceStr = "1분";
    if (timeMode === 180) timeChoiceStr = "3분";
    else if (timeMode === 300) timeChoiceStr = "5분";

    // 방에 비번이 있다면 별도 처리
    navigate(`/m/game/${roomId}?timeChoice=${timeChoiceStr}&roomName=`);
  }

  /** 목록 새로고침 */
  function handleRefresh() {
    socket.emit("requestWaitingRooms");
    socket.emit("requestOnlineUsers");
    // socket.emit("requestMyInfo");
  }

  return (
    <div className="w-full h-screen bg-[#3A3A3A] text-white flex flex-col">
      {/* 상단 탭 */}
      <div className="flex items-center bg-[#2B2B2B] h-12 px-4 space-x-4">
        <button
          onClick={handleCreateRoom}
          className="text-sm font-bold hover:text-yellow-200"
        >
          방 만들기
        </button>
        <button
          onClick={handleQuickJoin}
          className="text-sm font-bold hover:text-yellow-200"
        >
          빠른 입장
        </button>
        <button
          onClick={handleShop}
          className="text-sm font-bold hover:text-yellow-200"
        >
          상점
        </button>
        <button
          onClick={handleDictionary}
          className="text-sm font-bold hover:text-yellow-200"
        >
          사전
        </button>
        <button
          onClick={handleReplay}
          className="text-sm font-bold hover:text-yellow-200"
        >
          리플레이
        </button>
        <button
          onClick={handleRanking}
          className="text-sm font-bold hover:text-yellow-200"
        >
          랭킹
        </button>

        <div className="ml-auto text-xs text-gray-300">
          {/* 우측 여백 */}
        </div>
      </div>

      {/* 메인 영역: 좌(유저리스트+내정보), 우(방목록) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽 패널 */}
        <div className="w-64 bg-[#2B2B2B] flex flex-col">
          {/* 접속자 목록 */}
          <div className="flex-1 overflow-auto text-sm p-2">
            <div className="text-gray-200 mb-1">
              ■ 접속자 목록 [{userList.length}]
            </div>
            {userList.map((name, i) => (
              <div
                key={i}
                className="truncate hover:text-yellow-200 cursor-pointer"
              >
                {name}
              </div>
            ))}
          </div>

          {/* 내 정보 영역 */}
          <div className="bg-[#3A3A3A] p-3 flex items-center">
            {/* 프로필 이미지 */}
            <div className="w-14 h-14 mb-2 mr-2">
              <img
                src={myAvatar}
                alt="myAvatar"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="text-sm font-bold mb-1">
                <span className="mr-2">[{myInfo.level}]</span>
                {myInfo.nickname}
              </div>
              <div className="text-xs text-gray-300">
                통산 {myInfo.totalWins}승
              </div>

              <div className="text-sm mb-1">레벨 {myInfo.level}</div>

              {/* 경험치 바 */}
              <div className="w-full bg-[#4B4B4B] h-2 rounded relative">
                <div
                  className="bg-yellow-400 h-2 rounded"
                  style={{
                    width: `${(myInfo.exp / myInfo.expMax) * 100}%`
                  }}
                />
              </div>
              <div className="text-xs text-gray-200 mt-1">
                {myInfo.exp} / {myInfo.expMax}
              </div>
            </div>

            {/* 예: 레벨, 닉네임, 통산승, etc. */}

          </div>
        </div>

        {/* 가운데(방 목록) */}
        <div className="flex-1 bg-[#3A3A3A] flex flex-col p-2">
          {/* 방 목록 헤더 */}
          <div className="flex items-center justify-between h-10 px-2 bg-[#2B2B2B] rounded">
            <span className="text-sm font-bold">
              방 목록 [{waitingRooms.length}]
            </span>
            <button
              onClick={handleRefresh}
              className="text-xs text-gray-300 hover:text-white"
            >
              목록 새로고침
            </button>
          </div>

          {/* 방 목록 스크롤 영역 */}
          <div className="flex-1 overflow-auto mt-2 space-y-2">
            {waitingRooms.length === 0 && (
              <div className="text-gray-400 text-sm px-2">
                현재 대기중인 방이 없습니다.
              </div>
            )}

            {waitingRooms.map((room, idx) => {
              const playersCount = room.players.length;
              const maxPlayers = 2;
              let timeLabel = "1분";
              if (room.timeMode === 180) timeLabel = "3분";
              else if (room.timeMode === 300) timeLabel = "5분";

              // 패스워드 예시
              const hasPassword = !!room.hasPassword;
              const iconSrc = hasPassword ? lockIcon : unlockIcon;

              // ★ 진행중이면 붉은 배경, 아니면 기존 회색
              //   (bg-red-800 / text-white) vs (bg-[#4B4B4B] / text-gray-100)
              const rowClass = room.gameStarted
                ? "bg-red-800 text-white"
                : "bg-[#4B4B4B] text-gray-100";

              const displayRoomName = room.roomName || "???";
              const nicknamesStr = room.players.map((p) => p.nickname).join(", ");
              // 상태 표시
              const statusText = room.gameStarted ? "진행중" : "대기중";

              return (
                <div
                  key={idx}
                  className={`flex items-center rounded px-2 py-2 ${rowClass}`}
                >
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-sm">
                      {displayRoomName} | {nicknamesStr}
                    </span>
                    <span className="text-xs text-gray-300">
                      {playersCount}/{maxPlayers} | {timeLabel} | {statusText}
                    </span>
                  </div>

                  <img
                    src={iconSrc}
                    alt="lockIcon"
                    className="w-4 h-4 mr-2"
                  />

                  {/* 진행중이면 입장 버튼 비활성 (예시) */}
                  {!room.gameStarted && (
                    <button
                      onClick={() => handleChallenge(room.roomId, room.timeMode)}
                      className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 rounded"
                    >
                      입장
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
