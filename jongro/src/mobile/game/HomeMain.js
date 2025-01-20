import React, { useRef } from "react";
import Header from "./Header";
import Body from "./HomeBody";
import Bottom from "./Bottom";

export default function HomeMain() {
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
        <Body/>
      </div>
    </div>
  );
}
