export function Taskbar({
  leftElements,
  centerElements,
  rightElements,
}: {
  leftElements?: React.ReactNode;
  centerElements?: React.ReactNode;
  rightElements?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-14 justify-between bg-black/70 p-2 text-white backdrop-blur-md">
      <div className="flex items-center gap-2">{leftElements}</div>

      <div className="flex flex-1 items-center justify-center gap-2">
        {centerElements}
      </div>

      <div className="flex items-center gap-2">{rightElements}</div>
    </div>
  );
}

export function TaskbarApp({
  title,
  icon,
  isRunning,
  isMinimized,
  isPinned,
  onClick,
  onContextMenu,
}: {
  title: string;
  icon?: React.ReactNode;
  isRunning?: boolean;
  isMinimized?: boolean;
  isPinned?: boolean;
  onClick?: () => void;
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={`
        flex h-10 w-10 items-center justify-center border-b-2 p-2 cursor-pointer hover:bg-stone-800 rounded-t
        [&_svg]:h-5 [&_svg]:w-5
        ${
          isRunning
            ? isMinimized
              ? "border-gray-500"
              : "border-gray-100"
            : isPinned
              ? "border-stone-600"
              : "border-transparent"
        }
        `}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {icon}
    </button>
  );
}

export function DesktopIcon({
  title,
  icon,
  onClick,
  onContextMenu,
}: {
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      className="flex w-24 flex-col items-center gap-2 rounded-md p-3 text-white drop-shadow hover:bg-white/10 focus:bg-white/10 focus:outline-none [&_svg]:h-12 [&_svg]:w-12"
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm">
        {icon}
      </span>
      <span className="max-w-full truncate rounded bg-black/35 px-2 py-0.5 text-sm">
        {title}
      </span>
    </button>
  );
}
