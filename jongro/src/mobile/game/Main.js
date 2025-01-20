import React, { useRef } from "react";
import Header from "./Header";
import Body from "./Body";
import Bottom from "./Bottom";

export default function Main() {
  // Body 컴포넌트를 조작하기 위한 ref들
  // (이들 ref를 Body와 Bottom에 동시에 전달)
  const undoRef = useRef(null);
  const redoRef = useRef(null);
  const newRef = useRef(null);
  const hintRef = useRef(null);
  const giveUpRef = useRef(null);

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex-1 overflow-auto">
        <Body
          onUndoRef={undoRef}
          onRedoRef={redoRef}
          onNewRef={newRef}
          onHintRef={hintRef}
          onGiveUpRef={giveUpRef}
        />
      </div>

      <Bottom
        undoRef={undoRef}
        redoRef={redoRef}
        newRef={newRef}
        hintRef={hintRef}
        giveUpRef={giveUpRef}
      />
    </div>
  );
}
