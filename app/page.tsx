"use client";

import { Taskbar, TaskbarApp } from "@/components/taskbar";
import { Position, Size, Window } from "@/components/window";
import { apps, WindowInstance } from "@/lib/apps";
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

export default function Home() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [desktopSize, setDesktopSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());

    const timer = window.setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

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

  function launchApp(appId: string) {
    const app = apps.find((app) => app.id === appId);
    if (!app) return;

    const existingWindow = windows.find(
      (windowInstance) => windowInstance.appId === appId,
    );

    if (existingWindow) {
      restoreWindow(existingWindow.id);
      return;
    }

    setWindows((currentWindows) => {
      const size = { width: 400, height: 300 };

      return [
        ...currentWindows,
        {
          id: crypto.randomUUID(),
          appId: app.id,
          title: app.title,
          status: "open",
          zIndex: nextZIndex,
          position: clampPosition({ x: 4, y: 20 }, size, desktopSize),
          size,
        },
      ];
    });
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

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <Taskbar
        leftElements={<p>TsOS</p>}
        centerElements={apps
          .filter((app) => app.pinnedToTaskbar)
          .map((app) => {
            const appWindow = windows.find(
              (windowInstance) => windowInstance.appId === app.id,
            );

            return (
              <TaskbarApp
                key={app.id}
                title={app.title}
                icon={app.icon}
                isRunning={Boolean(appWindow)}
                isMinimized={appWindow?.status === "minimized"}
                onClick={() => launchApp(app.id)}
              />
            );
          })}
        rightElements={<span>{currentTime}</span>}
      />
      <div ref={desktopRef} className="relative min-h-0 flex-1 overflow-hidden">
        {windows.map((windowInstance) => {
          const app = apps.find((app) => app.id === windowInstance.appId);
          if (!app) return null;

          const AppComponent = app.component;
          return (
            <Window
              key={windowInstance.id}
              title={windowInstance.title}
              onClose={() => closeWindow(windowInstance.id)}
              onMinimize={() => minimizeWindow(windowInstance.id)}
              zIndex={windowInstance.zIndex}
              onFocus={() => focusWindow(windowInstance.id)}
              isMinimized={windowInstance.status === "minimized"}
              position={windowInstance.position}
              size={windowInstance.size}
              onMove={(newPosition) =>
                moveWindow(windowInstance.id, newPosition)
              }
            >
              <AppComponent />
            </Window>
          );
        })}
      </div>
    </main>
  );
}
