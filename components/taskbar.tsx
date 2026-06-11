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
    <div className="flex justify-between bg-black/70 backdrop-blur-md p-2 text-white">
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
  onClick,
}: {
  title: string;
  icon?: React.ReactNode;
  isRunning?: boolean;
  isMinimized?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`
        flex items-center border-b-2 gap-2 p-2 cursor-pointer hover:bg-stone-800 rounded-t
        ${isRunning ? (isMinimized ? "border-gray-500" : "border-gray-100") : "border-transparent"}
        `}
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
    </div>
  );
}
