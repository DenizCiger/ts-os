"use client";

import { FileSystemNode, getChildren, getNode, getParent, getPath } from "@/lib/files";
import { Folder, Ban, File, ArrowUp } from "lucide-react";
import { useRef, useState } from "react";

export type Position = { x: number; y: number };
export type Size = { width: number; height: number };

export function Window({
  title,
  children,
  onMinimize,
  onClose,
  onFocus,
  zIndex,
  isMinimized,
  position,
  size,
  onMove,
}: {
  title: string;
  children: React.ReactNode;
  onMinimize?: () => void;
  onClose?: () => void;
  onFocus?: () => void;
  zIndex?: number;
  isMinimized?: boolean;
  position: Position;
  size: Size;
  onMove: (newPosition: Position) => void;
}) {
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

    onMove({
      x: event.clientX - dragOffset.current.x,
      y: event.clientY - dragOffset.current.y,
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
          : "absolute border border-gray-500 backdrop-blur-md text-gray-300 rounded-md flex flex-col overflow-hidden"
      }
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex ?? 1,
      }}
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
      className="bg-black/20 text-gray-300 rounded-full w-6 h-6 cursor-pointer hover:bg-black/30"
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
  const [cwd, setCwd] = useState(1)
  const currentDirectory = getNode(cwd);
  const children: FileSystemNode[] = getChildren(cwd);
  const parent: FileSystemNode | undefined = currentDirectory === undefined ? undefined : getParent(currentDirectory)

  function handleFileClick(file: FileSystemNode) {
    switch (file.type) {
      case 'directory':
        setCwd(file.id)
        break;

      default:
        break;
    }
  }

  function renderFileIcon(file: FileSystemNode) {
    const iconClassName = "w-12 h-12";
    const Icon = file.type === "directory" ? Folder : File;

    return <Icon className={iconClassName} />;
  }


  function handleBackArrow(): void {
    if (parent) {
      setCwd(parent.id)
    }
  }

  return (
    <>
      <div className="w-full border-b border-stone-600 text-stone-400 flex justify-between">
        {currentDirectory ? getPath(currentDirectory) : "Unknown location"}
        {parent && (
          <ArrowUp onClick={() => handleBackArrow()} />
        )}
      </div>

      <div className="w-full h-full bg-transparent text-gray-300 flex flex-wrap gap-4">
        {children.map((file) => (
          <div key={file.id} className="flex flex-col items-center" onClick={() => handleFileClick(file)}>
            {renderFileIcon(file)}
            <h2>{file.name}</h2>
          </div>
        ))}
      </div>
    </>
  );
}



