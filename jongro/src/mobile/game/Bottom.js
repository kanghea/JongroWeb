import React from "react";

export default function Bottom({
  undoRef,
  redoRef,
  newRef,
  hintRef,
  giveUpRef,
}) {
  function handleUndoClick(){
    if(undoRef.current) {
      undoRef.current();
    }
  }
  function handleRedoClick(){
    if(redoRef.current) {
      redoRef.current();
    }
  }
  function handleNewClick(){
    if(newRef.current) {
      newRef.current();
    }
  }
  function handleHintClick(){
    if(hintRef.current) {
      hintRef.current(); // => Body의 handleHint( "intermediate" )
    }
  }
  function handleGiveUpClick(){
    if(giveUpRef.current){
      giveUpRef.current();
    }
  }

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-[#2B2B2B] text-white
        px-4 py-2
        flex items-center justify-center
      "
      style={{ height: "60px" }}
    >
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded">
          옵션
        </button>

        <button
          onClick={handleNewClick}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-sm rounded"
        >
          신규
        </button>

        <button
          onClick={handleHintClick}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-sm rounded"
        >
          힌트
        </button>

        <button
          onClick={handleUndoClick}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded"
        >
          뒤로
        </button>

        <button
          onClick={handleRedoClick}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded"
        >
          앞으로
        </button>

        <button
          onClick={handleGiveUpClick}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded text-black"
        >
          기권
        </button>
      </div>
    </div>
  );
}
