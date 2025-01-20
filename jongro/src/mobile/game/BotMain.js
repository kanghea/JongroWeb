import React, { useRef } from "react";
import Header from "./Header";
import AIBody from "./AIbody";  // AI vs Player 오목
import Bottom from "./Bottom";

export default function BotMain() {
  // Body(AIBody)와 Bottom을 연결할 Ref들
  const undoRef = useRef(null);
  const redoRef = useRef(null);
  const hintRef = useRef(null);
  const newRef = useRef(null);
  const giveUpRef = useRef(null);

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <Header />

      {/* 중앙 AIBody (오목 게임판) */}
      <div className="flex-1 overflow-auto">
        <AIBody
          onUndoRef={undoRef}
          onRedoRef={redoRef}
          onHintRef={hintRef}
          onNewRef={newRef}
          onGiveUpRef={giveUpRef}
        />
      </div>

      {/* 하단 NavBar */}
      <Bottom
        undoRef={undoRef}
        redoRef={redoRef}
        hintRef={hintRef}
        newRef={newRef}
        giveUpRef={giveUpRef}
      />
    </div>
  );
}
