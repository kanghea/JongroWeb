import React, { useRef } from "react";
import Header from "./Header";
import Body from "./Body";
import Bottom from "./Bottom";

export default function Main() {
  // Body 컴포넌트를 조작하기 위한 ref
  const bodyRef = useRef(null);

  // 뒤로
  const handleUndo = () => {
    if (bodyRef.current) {
      bodyRef.current.handleUndo();
    }
  };

  // 앞으로
  const handleRedo = () => {
    if (bodyRef.current) {
      bodyRef.current.handleRedo();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <Header />

      {/* 중앙 Body (오목 게임판) */}
      <div className="flex-1 overflow-auto">
        <Body ref={bodyRef} />
      </div>

      {/* 하단 NavBar */}
      <Bottom onUndo={handleUndo} onRedo={handleRedo} />
    </div>
  );
}
