export function Window({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-gray-500 border w-96 h-64 backdrop-blur-md text-gray-300 m-4 rounded-md flex flex-col overflow-hidden">
      <div className="flex justify-between border-b border-stone-500 bg-stone-950/50 p-2 w-full shrink-0">
        <p>{title}</p>
        <div className="flex gap-1 text-gray-300">
          <WindowButton>-</WindowButton>
          <WindowButton>X</WindowButton>
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
