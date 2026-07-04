"use client";

import { DesktopIcon, Taskbar, TaskbarApp } from "@/components/taskbar";
import { Position, Size, Window } from "@/components/window";
import { AppId, apps, WindowData, WindowInstance } from "@/lib/apps";
import { FileSystemNode, getNode, initialFiles, isTextFile } from "@/lib/files";
import { useEffect, useRef, useState } from "react";

function clampPosition(position: Position, windowSize: Size, frameSize: Size) {
  if (frameSize.width <= 0 || frameSize.height <= 0) return position;

  return {
    x: Math.min(
      Math.max(0, position.x),
      Math.max(0, frameSize.width - windowSize.width),
    ),
    y: Math.min(
      Math.max(0, position.y),
      Math.max(0, frameSize.height - windowSize.height),
    ),
  };
}

type AppContextMenu = {
  appId: AppId;
  x: number;
  y: number;
};

export default function Home() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString(),
  );
  const [files, setFiles] = useState<FileSystemNode[]>(initialFiles);
  const [desktopSize, setDesktopSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [pinnedAppIds, setPinnedAppIds] = useState<AppId[]>([]);
  const [appContextMenu, setAppContextMenu] =
    useState<AppContextMenu | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!appContextMenu) return;

    const closeContextMenu = () => setAppContextMenu(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [appContextMenu]);

  useEffect(() => {
    const desktopElement = desktopRef.current;
    if (!desktopElement) return;

    const updateDesktopSize = () => {
      const { width, height } = desktopElement.getBoundingClientRect();
      const nextDesktopSize = { width, height };

      setDesktopSize(nextDesktopSize);
      setWindows((currentWindows) =>
        currentWindows.map((windowInstance) => ({
          ...windowInstance,
          position: clampPosition(
            windowInstance.position,
            windowInstance.size,
            nextDesktopSize,
          ),
        })),
      );
    };

    updateDesktopSize();

    const resizeObserver = new ResizeObserver(updateDesktopSize);
    resizeObserver.observe(desktopElement);

    return () => resizeObserver.disconnect();
  }, []);

  function restoreWindow(windowId: string) {
    setWindows((currentWindows) =>
      currentWindows.map((windowInstance) =>
        windowInstance.id === windowId
          ? { ...windowInstance, status: "open", zIndex: nextZIndex }
          : windowInstance,
      ),
    );
    setNextZIndex((currentZIndex) => currentZIndex + 1);
  }

  function getAppWindows(appId: AppId) {
    return windows.filter((windowInstance) => windowInstance.appId === appId);
  }

  function getApp(appId: AppId) {
    return apps.find((app) => app.id === appId);
  }

  function getTaskbarAppIds() {
    return apps
      .filter((app) => pinnedAppIds.includes(app.id) || getAppWindows(app.id).length > 0)
      .map((app) => app.id);
  }

  function getTopOpenWindow(appId: AppId) {
    return getAppWindows(appId)
      .filter((windowInstance) => windowInstance.status === "open")
      .sort((leftWindow, rightWindow) => rightWindow.zIndex - leftWindow.zIndex)[0];
  }

  function getNextMinimizedWindow(appId: AppId) {
    return getAppWindows(appId)
      .filter((windowInstance) => windowInstance.status === "minimized")
      .sort((leftWindow, rightWindow) => rightWindow.zIndex - leftWindow.zIndex)[0];
  }

  function getNotepadTitle(fileName?: string) {
    return fileName ? `Notepad - ${fileName}` : "Notepad";
  }

  function getWindowKey(appId: AppId, data: WindowData) {
    if (appId === "notepad" && data.type === "notepad" && data.fileId !== undefined) {
      return `${appId}:${data.fileId}`;
    }

    return `${appId}:${data.type === "notepad" ? "untitled" : "main"}`;
  }

  function createWindow(
    appId: AppId,
    title: string,
    data: WindowData,
    position: Position,
  ): WindowInstance {
    const size = { width: 400, height: 300 };

    return {
      id: getWindowKey(appId, data),
      appId,
      title,
      status: "open",
      zIndex: nextZIndex,
      position: clampPosition(position, size, desktopSize),
      size,
      data,
    };
  }

  function launchApp(appId: AppId) {
    const app = getApp(appId);
    if (!app) return;

    const minimizedWindow = getNextMinimizedWindow(appId);
    if (minimizedWindow) {
      restoreWindow(minimizedWindow.id);
      return;
    }

    const openWindow = getTopOpenWindow(appId);
    if (openWindow) {
      focusWindow(openWindow.id);
      return;
    }

    setWindows((currentWindows) => {
      return [
        ...currentWindows,
        createWindow(
          app.id,
          app.id === "notepad" ? getNotepadTitle() : app.title,
          app.id === "notepad"
            ? { type: "notepad", draftContent: "" }
            : { type: "explorer" },
          { x: 4, y: 20 },
        ),
      ];
    });
    setNextZIndex((currentZIndex) => currentZIndex + 1);
  }

  function openFile(fileId: number) {
    const file = getNode(files, fileId);
    if (!file || !isTextFile(file)) return;

    const windowId = getWindowKey("notepad", { type: "notepad", fileId });
    const existingWindow = windows.find(
      (windowInstance) => windowInstance.id === windowId,
    );

    if (existingWindow) {
      restoreWindow(existingWindow.id);
      return;
    }

    setWindows((currentWindows) => [
      ...currentWindows,
      createWindow(
        "notepad",
        getNotepadTitle(file.name),
        { type: "notepad", fileId },
        { x: 40, y: 40 },
      ),
    ]);
    setNextZIndex((currentZIndex) => currentZIndex + 1);
  }

  function minimizeWindow(windowId: string) {
    setWindows((currentWindows) =>
      currentWindows.map((windowInstance) =>
        windowInstance.id === windowId
          ? { ...windowInstance, status: "minimized" }
          : windowInstance,
      ),
    );
  }

  function closeWindow(windowId: string) {
    setWindows((currentWindows) =>
      currentWindows.filter((windowInstance) => windowInstance.id !== windowId),
    );
  }

  function moveWindow(windowId: string, newPosition: Position) {
    setWindows((currentWindows) =>
      currentWindows.map((windowInstance) =>
        windowInstance.id === windowId
          ? {
              ...windowInstance,
              position: clampPosition(
                newPosition,
                windowInstance.size,
                desktopSize,
              ),
            }
          : windowInstance,
      ),
    );
  }

  function focusWindow(windowId: string) {
    const targetWindow = windows.find(
      (windowInstance) => windowInstance.id === windowId,
    );

    if (!targetWindow) return;

    if (targetWindow.zIndex === nextZIndex - 1) return; // Already focused

    setWindows((currentWindows) =>
      currentWindows.map((windowInstance) =>
        windowInstance.id === windowId
          ? { ...windowInstance, zIndex: nextZIndex }
          : windowInstance,
      ),
    );
    setNextZIndex((currentZIndex) => currentZIndex + 1);
  }

  function pinApp(appId: AppId) {
    setPinnedAppIds((currentPinnedAppIds) =>
      currentPinnedAppIds.includes(appId)
        ? currentPinnedAppIds
        : [...currentPinnedAppIds, appId],
    );
    setAppContextMenu(null);
  }

  function unpinApp(appId: AppId) {
    setPinnedAppIds((currentPinnedAppIds) =>
      currentPinnedAppIds.filter((pinnedAppId) => pinnedAppId !== appId),
    );
    setAppContextMenu(null);
  }

  function openAppContextMenu(
    event: React.MouseEvent<HTMLElement>,
    appId: AppId,
  ) {
    event.preventDefault();
    event.stopPropagation();

    setAppContextMenu({
      appId,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function updateTextFile(fileId: number, content: string) {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === fileId && file.type === "text"
          ? { ...file, content }
          : file,
      ),
    );
  }

  function updateDraftWindow(windowId: string, content: string) {
    setWindows((currentWindows) =>
      currentWindows.map((windowInstance) =>
        windowInstance.id === windowId && windowInstance.data.type === "notepad"
          ? {
              ...windowInstance,
              data: {
                ...windowInstance.data,
                draftContent: content,
              },
            }
          : windowInstance,
      ),
    );
  }

  function getNotepadState(windowInstance: WindowInstance) {
    if (windowInstance.data.type !== "notepad") {
      return null;
    }

    const file =
      windowInstance.data.fileId === undefined
        ? undefined
        : getNode(files, windowInstance.data.fileId);

    if (file && !isTextFile(file)) {
      return null;
    }

    return {
      file,
      value: file?.content ?? windowInstance.data.draftContent ?? "",
      onChange: (content: string) => {
        if (file) {
          updateTextFile(file.id, content);
          return;
        }

        updateDraftWindow(windowInstance.id, content);
      },
    };
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <Taskbar
        leftElements={<p>TsOS</p>}
        centerElements={getTaskbarAppIds()
          .map((appId) => {
            const app = getApp(appId);
            if (!app) return null;

            const appWindows = getAppWindows(app.id);
            const topOpenWindow = getTopOpenWindow(app.id);
            const topMinimizedWindow = getNextMinimizedWindow(app.id);
            const isPinned = pinnedAppIds.includes(app.id);

            return (
              <TaskbarApp
                key={app.id}
                title={app.title}
                icon={app.icon}
                isRunning={appWindows.length > 0}
                isPinned={isPinned}
                isMinimized={!topOpenWindow && Boolean(topMinimizedWindow)}
                onClick={() => launchApp(app.id)}
                onContextMenu={(event) => openAppContextMenu(event, app.id)}
              />
            );
          })}
        rightElements={<span>{currentTime}</span>}
      />
      <div ref={desktopRef} className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute left-4 top-4 z-0 flex flex-col gap-4">
          {apps.map((app) => (
            <DesktopIcon
              key={app.id}
              title={app.title}
              icon={app.icon}
              onClick={() => launchApp(app.id)}
              onContextMenu={(event) => openAppContextMenu(event, app.id)}
            />
          ))}
        </div>

        {windows.map((windowInstance) => {
          const app = getApp(windowInstance.appId);
          if (!app) return null;

          const windowProps = {
            title: windowInstance.title,
            onClose: () => closeWindow(windowInstance.id),
            onMinimize: () => minimizeWindow(windowInstance.id),
            zIndex: windowInstance.zIndex,
            onFocus: () => focusWindow(windowInstance.id),
            isMinimized: windowInstance.status === "minimized",
            position: windowInstance.position,
            size: windowInstance.size,
            onMove: (newPosition: Position) =>
              moveWindow(windowInstance.id, newPosition),
          };

          if (app.id === "notepad") {
            const appProps = getNotepadState(windowInstance);
            if (!appProps) return null;

            return (
              <Window key={windowInstance.id} {...windowProps}>
                <app.component {...appProps} />
              </Window>
            );
          }

          return (
            <Window key={windowInstance.id} {...windowProps}>
              <app.component files={files} onOpenFile={openFile} />
            </Window>
          );
        })}

        {appContextMenu && (
          <div
            className="fixed z-[9999] min-w-40 overflow-hidden rounded-md border border-stone-600 bg-stone-950/95 py-1 text-sm text-stone-100 shadow-xl backdrop-blur"
            style={{ left: appContextMenu.x, top: appContextMenu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            {pinnedAppIds.includes(appContextMenu.appId) ? (
              <button
                type="button"
                className="block w-full px-3 py-2 text-left hover:bg-stone-800"
                onClick={() => unpinApp(appContextMenu.appId)}
              >
                Unpin from taskbar
              </button>
            ) : (
              <button
                type="button"
                className="block w-full px-3 py-2 text-left hover:bg-stone-800"
                onClick={() => pinApp(appContextMenu.appId)}
              >
                Pin to taskbar
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
