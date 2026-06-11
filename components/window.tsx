"use client";

import { useRef, useState } from "react";

export function Window({
  title,
  children,
  onMinimize,
  onClose,
  onFocus,
  zIndex,
  isMinimized,
}: {
  title: string;
  children: React.ReactNode;
  onMinimize?: () => void;
  onClose?: () => void;
  onFocus?: () => void;
  zIndex?: number;
  isMinimized?: boolean;
}) {
  const [position, setPosition] = useState({ x: 4, y: 60 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;

    dragOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.buttons) return;

    setPosition({
      x: Math.max(0, event.clientX - dragOffset.current.x),
      y: Math.max(0, event.clientY - dragOffset.current.y),
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      className={
        isMinimized
          ? "hidden"
          : "absolute border border-gray-500 w-96 h-64 backdrop-blur-md text-gray-300 rounded-md flex flex-col overflow-hidden"
      }
      style={{ left: position.x, top: position.y, zIndex: zIndex ?? 1 }}
      onPointerDown={onFocus}
    >
      <div
        className="flex cursor-grab justify-between border-b border-stone-500 bg-stone-950/50 p-2 w-full shrink-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <p>{title}</p>
        <div className="flex gap-1 text-gray-300">
          <WindowButton onClick={onMinimize}>-</WindowButton>
          <WindowButton onClick={onClose}>X</WindowButton>
        </div>
      </div>
      <div className="p-2 flex-1 min-h-0 bg-black/50">{children}</div>
    </div>
  );
}

export function WindowButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-stone-600 bg-stone-800/50 rounded-full w-6 h-6"
    >
      {children}
    </button>
  );
}

export function NotepadApp() {
  return (
    <textarea
      className="w-full h-full bg-transparent text-gray-300 outline-none resize-none"
      placeholder="Type here..."
    />
  );
}

export function ExplorerApp() {
  return (
    <div className="w-full h-full bg-transparent text-gray-300 outline-none resize-none p-2">
      <p>This is the Explorer app.</p>
      <p>UI will be added here.</p>
    </div>
  );
}
