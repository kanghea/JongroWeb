import React from "react";

export default function Bottom({ onUndo, onRedo }) {
  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-[#2B2B2B] text-white
        px-4 py-2
        flex items-center justify-center
      "
      style={{ height: "60px" }} // 바닥 높이
    >
      {/* 버튼들을 가운데 정렬 */}
      <div className="flex items-center space-x-3">
        <button className="px-3 py-1 bg-[#4C4C4C] rounded hover:bg-[#5C5C5C] text-sm">
          옵션
        </button>
        <button className="px-3 py-1 bg-[#4C4C4C] rounded hover:bg-[#5C5C5C] text-sm">
          신규
        </button>
        <button className="px-3 py-1 bg-[#4C4C4C] rounded hover:bg-[#5C5C5C] text-sm">
          힌트
        </button>
        <button
          className="px-3 py-1 bg-[#4C4C4C] rounded hover:bg-[#5C5C5C] text-sm"
          onClick={onUndo}
        >
          뒤로
        </button>
        <button
          className="px-3 py-1 bg-[#4C4C4C] rounded hover:bg-[#5C5C5C] text-sm"
          onClick={onRedo}
        >
          앞으로
        </button>
      </div>
    </div>
  );
}
